package com.scommit.global.security;

import com.scommit.domain.user.user.entity.UserRole;
import com.scommit.global.security.jwt.JwtProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtProvider jwtProvider;

    @Value("${jwt.secret-key}")
    private String secretKey;

    private String validToken() {
        return jwtProvider.generateAccessToken(1L, "user@test.com", "nickname", UserRole.USER);
    }

    private String expiredToken() {
        return new JwtProvider(secretKey, Duration.ofMillis(-1))
                .generateAccessToken(1L, "user@test.com", "nickname", UserRole.USER);
    }

    @Test
    @DisplayName("/api/users/** 에 유효한 토큰으로 요청하면 인증을 통과한다 (401이 아니다)")
    void protectedEndpoint_withValidToken_notUnauthorized() throws Exception {
        mockMvc.perform(get("/api/users/profile")
                        .header("Authorization", "Bearer " + validToken()))
                .andExpect(result ->
                        assertThat(result.getResponse().getStatus())
                                .isNotEqualTo(HttpStatus.UNAUTHORIZED.value()));
    }

    @Test
    @DisplayName("/api/users/** 에 토큰 없이 요청하면 401이다")
    void protectedEndpoint_withNoToken_returns401() throws Exception {
        mockMvc.perform(get("/api/users/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("/api/users/** 에 만료된 토큰으로 요청하면 401이다")
    void protectedEndpoint_withExpiredToken_returns401() throws Exception {
        mockMvc.perform(get("/api/users/profile")
                        .header("Authorization", "Bearer " + expiredToken()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("/api/users/login 은 토큰 없이 요청해도 401이 아니다 (permitAll)")
    void loginEndpoint_withNoToken_notUnauthorized() throws Exception {
        mockMvc.perform(get("/api/users/login"))
                .andExpect(result ->
                        assertThat(result.getResponse().getStatus())
                                .isNotEqualTo(HttpStatus.UNAUTHORIZED.value()));
    }
}
