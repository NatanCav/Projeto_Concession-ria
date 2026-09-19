package com.concessionaria.auth;

import com.concessionaria.auth.dto.LoginRequest;
import com.concessionaria.auth.dto.LoginResponse;
import com.concessionaria.security.JwtAuthenticationFilter;
import com.concessionaria.user.UserRole;
import com.concessionaria.user.dto.UserResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = AuthController.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
)
@Import(AuthControllerTest.TestSecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        SecurityFilterChain testFilterChain(HttpSecurity http) throws Exception {
            http.csrf(csrf -> csrf.disable())
                    .exceptionHandling(ex -> ex
                            .authenticationEntryPoint((request, response, authException) -> response.sendError(401))
                            .accessDeniedHandler((request, response, accessDeniedException) -> response.sendError(403)))
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                            .anyRequest().authenticated());
            return http.build();
        }
    }

    private UserResponse sampleUser() {
        return new UserResponse(1L, "Administrador", "admin@concessionaria.dev", UserRole.ADMIN, true, Instant.now());
    }

    @Test
    void login_returnsToken_whenCredentialsAreValid() throws Exception {
        when(authService.login(any())).thenReturn(
                new LoginResponse("fake-jwt-token", "Bearer", 28_800_000L, sampleUser()));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin@concessionaria.dev", "DevAdmin123!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("fake-jwt-token"))
                .andExpect(jsonPath("$.user.email").value("admin@concessionaria.dev"));
    }

    @Test
    void login_returnsUnauthorized_whenCredentialsAreInvalid() throws Exception {
        when(authService.login(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin@concessionaria.dev", "wrong"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_returnsBadRequest_whenEmailIsBlank() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("", "any-password"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_isAccessible_withoutAuthentication() throws Exception {
        when(authService.login(any())).thenReturn(
                new LoginResponse("fake-jwt-token", "Bearer", 28_800_000L, sampleUser()));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin@concessionaria.dev", "DevAdmin123!"))))
                .andExpect(status().isOk());
    }

    @Test
    void me_returnsUnauthorized_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin@concessionaria.dev", authorities = "ROLE_ADMIN")
    void me_returnsCurrentUser_whenAuthenticated() throws Exception {
        when(authService.me("admin@concessionaria.dev")).thenReturn(sampleUser());

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@concessionaria.dev"));
    }
}
