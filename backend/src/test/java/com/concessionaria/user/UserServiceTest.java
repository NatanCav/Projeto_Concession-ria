package com.concessionaria.user;

import com.concessionaria.exception.DuplicateResourceException;
import com.concessionaria.exception.ResourceNotFoundException;
import com.concessionaria.user.dto.UserCreateRequest;
import com.concessionaria.user.dto.UserResponse;
import com.concessionaria.user.dto.UserUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder);
        lenient().when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    private User existingUser(Long id, String email) {
        User user = new User();
        user.setId(id);
        user.setName("Vendedor Teste");
        user.setEmail(email);
        user.setPasswordHash("old-hash");
        user.setRole(UserRole.VENDEDOR);
        user.setActive(true);
        return user;
    }

    @Test
    void create_hashesPasswordAndPersistsActiveUser_whenEmailIsUnique() {
        when(userRepository.existsByEmailIgnoreCase("vendedor@concessionaria.dev")).thenReturn(false);
        when(passwordEncoder.encode("Senha123!")).thenReturn("hashed-password");

        UserResponse response = userService.create(
                new UserCreateRequest("Vendedor Teste", "vendedor@concessionaria.dev", "Senha123!", UserRole.VENDEDOR));

        assertThat(response.email()).isEqualTo("vendedor@concessionaria.dev");
        assertThat(response.active()).isTrue();
        assertThat(response.role()).isEqualTo(UserRole.VENDEDOR);
    }

    @Test
    void create_throwsDuplicateResource_whenEmailAlreadyRegistered() {
        when(userRepository.existsByEmailIgnoreCase("vendedor@concessionaria.dev")).thenReturn(true);

        assertThatThrownBy(() -> userService.create(
                new UserCreateRequest("Vendedor Teste", "vendedor@concessionaria.dev", "Senha123!", UserRole.VENDEDOR)))
                .isInstanceOf(DuplicateResourceException.class);

        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void update_keepsCurrentPasswordHash_whenNewPasswordIsBlank() {
        User existing = existingUser(1L, "vendedor@concessionaria.dev");
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.findByEmailIgnoreCase("vendedor@concessionaria.dev")).thenReturn(Optional.of(existing));

        userService.update(1L, new UserUpdateRequest("Vendedor Editado", "vendedor@concessionaria.dev", UserRole.VENDEDOR, ""));

        assertThat(existing.getPasswordHash()).isEqualTo("old-hash");
        assertThat(existing.getName()).isEqualTo("Vendedor Editado");
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void update_reHashesPassword_whenNewPasswordProvided() {
        User existing = existingUser(1L, "vendedor@concessionaria.dev");
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.findByEmailIgnoreCase("vendedor@concessionaria.dev")).thenReturn(Optional.of(existing));
        when(passwordEncoder.encode("NovaSenha123!")).thenReturn("new-hash");

        userService.update(1L, new UserUpdateRequest("Vendedor Teste", "vendedor@concessionaria.dev", UserRole.VENDEDOR, "NovaSenha123!"));

        assertThat(existing.getPasswordHash()).isEqualTo("new-hash");
    }

    @Test
    void update_throwsDuplicateResource_whenEmailBelongsToAnotherUser() {
        User existing = existingUser(1L, "vendedor@concessionaria.dev");
        User other = existingUser(2L, "outro@concessionaria.dev");
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.findByEmailIgnoreCase("outro@concessionaria.dev")).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> userService.update(1L,
                new UserUpdateRequest("Vendedor Teste", "outro@concessionaria.dev", UserRole.VENDEDOR, null)))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void update_allowsKeepingOwnEmail_withoutThrowingDuplicate() {
        User existing = existingUser(1L, "vendedor@concessionaria.dev");
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.findByEmailIgnoreCase("vendedor@concessionaria.dev")).thenReturn(Optional.of(existing));

        UserResponse response = userService.update(1L,
                new UserUpdateRequest("Vendedor Teste", "vendedor@concessionaria.dev", UserRole.VENDEDOR, null));

        assertThat(response.email()).isEqualTo("vendedor@concessionaria.dev");
    }

    @Test
    void changeStatus_updatesActiveFlag() {
        User existing = existingUser(1L, "vendedor@concessionaria.dev");
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));

        UserResponse response = userService.changeStatus(1L, false);

        assertThat(response.active()).isFalse();
    }

    @Test
    void delete_removesUser_whenExists() {
        User existing = existingUser(1L, "vendedor@concessionaria.dev");
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));

        userService.delete(1L);

        verify(userRepository).delete(existing);
    }

    @Test
    void delete_throwsResourceNotFound_whenUserDoesNotExist() {
        when(userRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.delete(404L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
