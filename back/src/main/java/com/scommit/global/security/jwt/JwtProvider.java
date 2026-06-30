package com.scommit.global.security.jwt;

import com.scommit.domain.user.user.entity.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ClaimsBuilder;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class JwtProvider {
    @Value("${jwt.secretKey}")
    private String secretKey;
    @Value("${jwt.accessTokenExpiration}")
    private Duration accessTokenExpiration;

    public String generateAccessToken(Long userId, UserRole role) {

        throw new UnsupportedOperationException();
    }

    public Claims parseAccessToken(String token) {
        throw new UnsupportedOperationException();
    }
}
