package com.concessionaria.auth;

import com.concessionaria.auth.dto.LoginRequest;
import com.concessionaria.auth.dto.LoginResponse;
import com.concessionaria.exception.ResourceNotFoundException;
import com.concessionaria.security.JwtTokenProvider;
import com.concessionaria.user.User;
import com.concessionaria.user.UserRepository;
import com.concessionaria.user.UserRole;
import com.concessionaria.user.dto.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(authenticationManager, userRepository, jwtTokenProvider);
    }

    private User adminUser() {
        User user = new User();
        user.setId(1L);
        user.setName("Administrador");
        user.setEmail("admin@concessionaria.dev");
        user.setPasswordHash("hashed");
        user.setRole(UserRole.ADMIN);
        user.setActive(true);
        return user;
    }

    @Test
    void login_returnsTokenAndUser_whenCredentialsAreValid() {
        User user = adminUser();
        when(userRepository.findByEmailIgnoreCase("admin@concessionaria.dev")).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken("admin@concessionaria.dev", "ADMIN", "Administrador"))
                .thenReturn("fake-jwt-token");
        when(jwtTokenProvider.getExpirationMs()).thenReturn(28_800_000L);

        LoginResponse response = authService.login(new LoginRequest("admin@concessionaria.dev", "correct-password"));

        assertThat(response.token()).isEqualTo("fake-jwt-token");
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.expiresInMs()).isEqualTo(28_800_000L);
        assertThat(response.user().email()).isEqualTo("admin@concessionaria.dev");
        assertThat(response.user().role()).isEqualTo(UserRole.ADMIN);

        verify(authenticationManager).authenticate(
                new UsernamePasswordAuthenticationToken("admin@concessionaria.dev", "correct-password"));
    }

    @Test
    void login_propagatesBadCredentials_whenAuthenticationManagerRejects() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("admin@concessionaria.dev", "wrong-password")))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void login_throwsResourceNotFound_whenAuthenticatedUserVanishedFromDatabase() {
        when(userRepository.findByEmailIgnoreCase("ghost@concessionaria.dev")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("ghost@concessionaria.dev", "any-password")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void me_returnsUser_whenEmailExists() {
        when(userRepository.findByEmailIgnoreCase("admin@concessionaria.dev")).thenReturn(Optional.of(adminUser()));

        UserResponse response = authService.me("admin@concessionaria.dev");

        assertThat(response.name()).isEqualTo("Administrador");
    }

    @Test
    void me_throwsResourceNotFound_whenEmailDoesNotExist() {
        when(userRepository.findByEmailIgnoreCase("unknown@concessionaria.dev")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.me("unknown@concessionaria.dev"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
