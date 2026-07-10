package com.scommit.global.security.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "auth-token")
public record AuthTokenProperties(
        AccessToken accessToken,
        RefreshToken refreshToken
) {
    public record AccessToken(
            String secretKey,
            Duration expiration,
            Duration cookieMaxAge
    ) {}

    public record RefreshToken(
            Duration cookieMaxAge
    ) {}
}
