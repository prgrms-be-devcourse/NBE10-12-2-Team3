package com.scommit.global.security.jwt;

import com.scommit.domain.user.user.entity.User;
import com.scommit.domain.user.user.entity.UserRole;
import com.scommit.domain.user.user.service.UserService;
import com.scommit.global.security.SecurityHelper;
import com.scommit.global.security.SecurityUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Duration;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class JwtFilterTest {

    // JwtProviderTest와 동일한 시크릿 키 사용 (application-test.yml의 jwt.secretKey와 동일)
    private static final String SECRET = "dGVzdC1zZWNyZXQta2V5LWZvci1qd3QtdW5pdC10ZXN0aW5nLW1pbmltdW0tMzJieXRlcy1yZXF1aXJlZA==";
    private static final Duration EXPIRATION = Duration.ofMinutes(30);

    @Mock
    private SecurityHelper securityHelper;

    @Mock
    private UserService userService;

    private JwtProvider jwtProvider;
    private JwtFilter jwtFilter;

    @BeforeEach
    void setUp() {
        jwtProvider = new JwtProvider(SECRET, EXPIRATION);
        jwtFilter = new JwtFilter(jwtProvider, securityHelper, userService);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("유효한 토큰이 Authorization 헤더에 있으면 SecurityContext에 인증 정보가 채워진다")
    void validToken_setsAuthentication() throws Exception {
        String token = jwtProvider.generateAccessToken(1L, "user@test.com", "nickname", UserRole.USER);
        given(securityHelper.getHeader("Authorization", "")).willReturn("Bearer refresh-token-placeholder " + token);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/test");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        jwtFilter.doFilterInternal(request, response, chain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getPrincipal()).isInstanceOf(SecurityUser.class);
        assertThat(((SecurityUser) auth.getPrincipal()).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Authorization 헤더가 없으면 SecurityContext가 비어있고 다음 필터로 넘어간다")
    void noAuthorizationHeader_doesNotSetAuthentication_andChainProceeds() throws Exception {
        given(securityHelper.getHeader("Authorization", "")).willReturn("");
        given(securityHelper.getCookieValue("refreshToken", "")).willReturn("");
        given(securityHelper.getCookieValue("accessToken", "")).willReturn("");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/test");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        jwtFilter.doFilterInternal(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(chain.getRequest()).isNotNull(); // chain.doFilter()가 호출됐음을 확인
    }

    @Test
    @DisplayName("액세스 토큰이 만료됐어도 유효한 리프레시 토큰이 있으면 리프레시 토큰으로 재인증하고 다음 필터로 넘어간다")
    void expiredAccessToken_withValidRefreshToken_reAuthenticatesAndChainProceeds() throws Exception {
        JwtProvider expiredProvider = new JwtProvider(SECRET, Duration.ofMillis(-1));
        String expiredAccessToken = expiredProvider.generateAccessToken(1L, "user@test.com", "nickname", UserRole.USER);
        String refreshToken = "valid-refresh-token";
        User user = User.builder()
                .email("user@test.com")
                .nickname("nickname")
                .role(UserRole.USER)
                .build();
        given(securityHelper.getHeader("Authorization", "")).willReturn("Bearer " + refreshToken + " " + expiredAccessToken);
        given(userService.getUserByRefreshToken(refreshToken)).willReturn(Optional.of(user));
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/test");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        jwtFilter.doFilterInternal(request, response, chain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(((SecurityUser) auth.getPrincipal()).getEmail()).isEqualTo("user@test.com");
        assertThat(chain.getRequest()).isNotNull(); // chain.doFilter()가 호출됐음을 확인
    }
}