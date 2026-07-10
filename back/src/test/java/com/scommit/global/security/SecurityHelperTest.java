package com.scommit.global.security;

import com.scommit.global.security.jwt.AuthTokenProperties;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityHelperTest {

    private static final Duration ACCESS_TOKEN_COOKIE_MAX_AGE = Duration.ofMinutes(30);
    private static final Duration REFRESH_TOKEN_COOKIE_MAX_AGE = Duration.ofDays(30);

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private SecurityHelper securityHelper;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();

        AuthTokenProperties authTokenProperties = new AuthTokenProperties(
                new AuthTokenProperties.AccessToken("secret", Duration.ofMinutes(30), ACCESS_TOKEN_COOKIE_MAX_AGE),
                new AuthTokenProperties.RefreshToken(REFRESH_TOKEN_COOKIE_MAX_AGE)
        );

        securityHelper = new SecurityHelper(request, response, authTokenProperties);
        ReflectionTestUtils.setField(securityHelper, "cookieDomain", "localhost");
    }

    @Test
    @DisplayName("accessToken 쿠키는 access-token.cookie-max-age를 max-age로 사용한다")
    void setCookie_accessToken_usesAccessTokenCookieMaxAge() {
        securityHelper.setCookie("accessToken", "access-token-value");

        Cookie cookie = response.getCookie("accessToken");
        assertThat(cookie).isNotNull();
        assertThat(cookie.getMaxAge()).isEqualTo((int) ACCESS_TOKEN_COOKIE_MAX_AGE.toSeconds());
    }

    @Test
    @DisplayName("refreshToken 쿠키는 refresh-token.cookie-max-age를 max-age로 사용한다")
    void setCookie_refreshToken_usesRefreshTokenCookieMaxAge() {
        securityHelper.setCookie("refreshToken", "refresh-token-value");

        Cookie cookie = response.getCookie("refreshToken");
        assertThat(cookie).isNotNull();
        assertThat(cookie.getMaxAge()).isEqualTo((int) REFRESH_TOKEN_COOKIE_MAX_AGE.toSeconds());
    }

    @Test
    @DisplayName("accessToken과 refreshToken 쿠키의 max-age는 서로 다르다")
    void setCookie_accessTokenAndRefreshToken_haveDifferentMaxAge() {
        securityHelper.setCookie("accessToken", "access-token-value");
        securityHelper.setCookie("refreshToken", "refresh-token-value");

        int accessTokenMaxAge = response.getCookie("accessToken").getMaxAge();
        int refreshTokenMaxAge = response.getCookie("refreshToken").getMaxAge();

        assertThat(accessTokenMaxAge).isNotEqualTo(refreshTokenMaxAge);
    }

    @Test
    @DisplayName("값이 비어있으면 쿠키 이름과 무관하게 max-age를 0으로 설정해 즉시 만료시킨다")
    void setCookie_blankValue_setsMaxAgeToZero() {
        securityHelper.setCookie("refreshToken", "");

        Cookie cookie = response.getCookie("refreshToken");
        assertThat(cookie).isNotNull();
        assertThat(cookie.getMaxAge()).isZero();
    }

    @Test
    @DisplayName("getAccessTokenCookieExpiresInSecond는 access-token.cookie-max-age를 초 단위로 반환한다")
    void getAccessTokenCookieExpiresInSecond_returnsAccessTokenCookieMaxAgeInSeconds() {
        int expiresInSecond = securityHelper.getAccessTokenCookieExpiresInSecond();

        assertThat(expiresInSecond).isEqualTo((int) ACCESS_TOKEN_COOKIE_MAX_AGE.toSeconds());
    }
}
