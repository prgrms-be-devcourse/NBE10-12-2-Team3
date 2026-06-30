package com.scommit.global.security.jwt;

import com.scommit.domain.user.user.entity.UserRole;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class JwtFilterTest {

    // JwtProviderTest와 동일한 시크릿 키 사용 (application-test.yml의 jwt.secretKey와 동일)
    private static final String SECRET = "dGVzdC1zZWNyZXQta2V5LWZvci1qd3QtdW5pdC10ZXN0aW5nLW1pbmltdW0tMzJieXRlcy1yZXF1aXJlZA==";
    private static final Duration EXPIRATION = Duration.ofMinutes(30);

    private JwtProvider jwtProvider;
    private JwtFilter jwtFilter;

    @BeforeEach
    void setUp() {
        jwtProvider = new JwtProvider(SECRET, EXPIRATION);
        jwtFilter = new JwtFilter(jwtProvider);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("유효한 토큰이 Authorization 헤더에 있으면 SecurityContext에 인증 정보가 채워진다")
    void validToken_setsAuthentication() throws Exception {
        String token = jwtProvider.generateAccessToken(1L, UserRole.USER);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        jwtFilter.doFilterInternal(request, response, chain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getPrincipal()).isEqualTo(1L);
        assertThat(auth.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .contains("ROLE_" + UserRole.USER.name());
    }

    @Test
    @DisplayName("Authorization 헤더가 없으면 SecurityContext가 비어있고 다음 필터로 넘어간다")
    void noAuthorizationHeader_doesNotSetAuthentication_andChainProceeds() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        jwtFilter.doFilterInternal(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(chain.getRequest()).isNotNull(); // chain.doFilter()가 호출됐음을 확인
    }

    @Test
    @DisplayName("만료된 토큰이면 SecurityContext가 비어있고 다음 필터로 넘어간다")
    void expiredToken_doesNotSetAuthentication_andChainProceeds() throws Exception {
        JwtProvider expiredProvider = new JwtProvider(SECRET, Duration.ofMillis(-1));
        String expiredToken = expiredProvider.generateAccessToken(1L, UserRole.USER);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + expiredToken);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        jwtFilter.doFilterInternal(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(chain.getRequest()).isNotNull(); // chain.doFilter()가 호출됐음을 확인
    }
}
