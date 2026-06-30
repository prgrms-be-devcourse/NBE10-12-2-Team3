package com.scommit.global.security.jwt;

import com.scommit.domain.user.user.entity.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtProviderTest {

    // HS256은 최소 32바이트(256비트) 키 필요
    private static final String SECRET = "test-secret-key-for-jwt-unit-testing-minimum-32bytes-required";
    private static final long EXPIRATION_MS = 3_600_000L;

    private JwtProvider jwtProvider;

    @BeforeEach
    void setUp() {
        jwtProvider = new JwtProvider();
        ReflectionTestUtils.setField(jwtProvider, "secretKey", SECRET);
        ReflectionTestUtils.setField(jwtProvider, "accessTokenExpiration", EXPIRATION_MS);
    }

    @Test
    @DisplayName("generateAccessToken: 토큰 문자열을 반환한다")
    void generateAccessToken_returnsNonEmptyToken() {
        String token = jwtProvider.generateAccessToken(1L, UserRole.USER);

        assertThat(token).isNotNull().isNotEmpty();
    }

    @Nested
    @DisplayName("parseAccessToken: 발급한 토큰의 클레임이 그대로 복원된다")
    class ParseAccessToken {

        @Test
        @DisplayName("sub 클레임에 userId가 문자열로 저장된다")
        void sub_containsUserId() {
            Long userId = 42L;
            String token = jwtProvider.generateAccessToken(userId, UserRole.USER);

            Claims claims = jwtProvider.parseAccessToken(token);

            assertThat(claims.getSubject()).isEqualTo(String.valueOf(userId));
        }

        @Test
        @DisplayName("email 클레임이 그대로 복원된다")
        void email_isPreserved() {
            String email = "user@example.com";
            String token = jwtProvider.generateAccessToken(1L, UserRole.USER);

            Claims claims = jwtProvider.parseAccessToken(token);

            assertThat(claims.get("email", String.class)).isEqualTo(email);
        }

        @Test
        @DisplayName("role 클레임이 저장되고 UserRole enum으로 복원된다 - USER")
        void role_restoredAsEnum_user() {
            String token = jwtProvider.generateAccessToken(1L, UserRole.USER);

            Claims claims = jwtProvider.parseAccessToken(token);
            UserRole parsedRole = UserRole.valueOf(claims.get("role", String.class));

            assertThat(parsedRole).isEqualTo(UserRole.USER);
        }

        @Test
        @DisplayName("role 클레임이 저장되고 UserRole enum으로 복원된다 - ADMIN")
        void role_restoredAsEnum_admin() {
            String token = jwtProvider.generateAccessToken(1L, UserRole.ADMIN);

            Claims claims = jwtProvider.parseAccessToken(token);
            UserRole parsedRole = UserRole.valueOf(claims.get("role", String.class));

            assertThat(parsedRole).isEqualTo(UserRole.ADMIN);
        }
    }

    @Test
    @DisplayName("parseAccessToken: 만료된 토큰은 ExpiredJwtException을 던진다")
    void parseAccessToken_expired_throwsExpiredJwtException() {
        JwtProvider expiredProvider = new JwtProvider();
        ReflectionTestUtils.setField(expiredProvider, "secretKey", SECRET);
        ReflectionTestUtils.setField(expiredProvider, "accessTokenExpiration", -1L);
        String expiredToken = expiredProvider.generateAccessToken(1L, UserRole.USER);

        assertThatThrownBy(() -> expiredProvider.parseAccessToken(expiredToken))
                .isInstanceOf(ExpiredJwtException.class);
    }
}
