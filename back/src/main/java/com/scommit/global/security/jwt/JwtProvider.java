package com.scommit.global.security.jwt;

import com.scommit.domain.user.user.entity.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.util.Date;

@Component
public class JwtProvider {

    private final SecretKey signingKey;
    private final Duration accessTokenExpiration;

    public JwtProvider(
            @Value("${jwt.secret-key}") String secretKey,
            @Value("${jwt.token.access-token-expiration}") Duration accessTokenExpiration
    ) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenExpiration = accessTokenExpiration;
    }

    public String generateAccessToken(Long userId, String email, String nickname, UserRole role) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + accessTokenExpiration.toMillis());
        return Jwts.builder()
                .claim("id", userId)
                .claim("email", email)
                .claim("nickname", nickname)
                .claim("role", role.name())
                .issuedAt(now)
                .expiration(expirationDate)
                .signWith(signingKey)
                .compact();
    }

    public record AccessTokenPayload(Long id, String email, String nickname, UserRole role) {}

    public AccessTokenPayload parseAccessToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return new AccessTokenPayload(
                claims.get("id", Long.class),
                claims.get("email", String.class),
                claims.get("nickname", String.class),
                UserRole.valueOf(claims.get("role", String.class))
        );
    }
}
