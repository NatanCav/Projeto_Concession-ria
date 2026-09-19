package com.concessionaria.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private static final String SECRET = "unit-test-secret-key-with-enough-length-for-hs384-1234567890";

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(SECRET, 60_000L);
    }

    @Test
    void generateToken_embedsEmailAsSubject() {
        String token = jwtTokenProvider.generateToken("admin@concessionaria.dev", "ADMIN", "Administrador");

        assertThat(jwtTokenProvider.getEmailFromToken(token)).isEqualTo("admin@concessionaria.dev");
    }

    @Test
    void generateToken_embedsRoleClaim() {
        String token = jwtTokenProvider.generateToken("vendedor@concessionaria.dev", "VENDEDOR", "Vendedor");

        assertThat(jwtTokenProvider.getRoleFromToken(token)).isEqualTo("VENDEDOR");
    }

    @Test
    void isValid_returnsTrue_forFreshlyGeneratedToken() {
        String token = jwtTokenProvider.generateToken("admin@concessionaria.dev", "ADMIN", "Administrador");

        assertThat(jwtTokenProvider.isValid(token)).isTrue();
    }

    @Test
    void isValid_returnsFalse_forGarbageString() {
        assertThat(jwtTokenProvider.isValid("this-is-not-a-jwt")).isFalse();
    }

    @Test
    void isValid_returnsFalse_forTamperedToken() {
        String token = jwtTokenProvider.generateToken("admin@concessionaria.dev", "ADMIN", "Administrador");
        String tampered = token.substring(0, token.length() - 1) + (token.endsWith("A") ? "B" : "A");

        assertThat(jwtTokenProvider.isValid(tampered)).isFalse();
    }

    @Test
    void isValid_returnsFalse_forExpiredToken() {
        JwtTokenProvider alreadyExpiredProvider = new JwtTokenProvider(SECRET, -60_000L);
        String expiredToken = alreadyExpiredProvider.generateToken("admin@concessionaria.dev", "ADMIN", "Administrador");

        assertThat(jwtTokenProvider.isValid(expiredToken)).isFalse();
    }

    @Test
    void isValid_returnsFalse_forTokenSignedWithADifferentSecret() {
        JwtTokenProvider otherProvider = new JwtTokenProvider(
                "a-completely-different-secret-key-also-long-enough-9876543210", 60_000L);
        String tokenFromOtherIssuer = otherProvider.generateToken("admin@concessionaria.dev", "ADMIN", "Administrador");

        assertThat(jwtTokenProvider.isValid(tokenFromOtherIssuer)).isFalse();
    }
}
