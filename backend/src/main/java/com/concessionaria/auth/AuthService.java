package com.concessionaria.auth;

import com.concessionaria.auth.dto.LoginRequest;
import com.concessionaria.auth.dto.LoginResponse;
import com.concessionaria.exception.ResourceNotFoundException;
import com.concessionaria.security.JwtTokenProvider;
import com.concessionaria.user.User;
import com.concessionaria.user.UserRepository;
import com.concessionaria.user.dto.UserResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                        JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> ResourceNotFoundException.of("Usuário", request.email()));

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getName());
        return new LoginResponse(token, "Bearer", jwtTokenProvider.getExpirationMs(), UserResponse.from(user));
    }

    public UserResponse me(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ResourceNotFoundException.of("Usuário", email));
        return UserResponse.from(user);
    }
}
