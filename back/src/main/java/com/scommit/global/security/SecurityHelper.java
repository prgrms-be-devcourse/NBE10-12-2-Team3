package com.scommit.global.security;

import com.scommit.domain.user.user.entity.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SecurityHelper { // 14183의 Rq 복붙
    private final HttpServletRequest req;
    private final HttpServletResponse resp;
    @Value("${jwt.cookie.max-age}")
    private Duration cookieMaxAge;

    public User getActor() {
        return Optional.ofNullable(
                        SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                )
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof SecurityUser)
                .map(principal -> (SecurityUser) principal)
                .map(securityUser -> new User(securityUser.getId(), securityUser.getUsername(), securityUser.getEmail()))
                .orElse(null);
    }

    public String getHeader(String name, String defaultValue) {
        return Optional
                .ofNullable(req.getHeader(name))
                .filter(headerValue -> !headerValue.isBlank())
                .orElse(defaultValue);
    }

    public void setHeader(String name, String value) {
        if (value == null) value = "";

        if (value.isBlank()) {
            req.removeAttribute(name);
        } else {
            resp.setHeader(name, value);
        }
    }

    public String getCookieValue(String name, String defaultValue) {
        return Arrays.stream(Optional.ofNullable(req.getCookies()).orElse(new Cookie[0]))
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElse(defaultValue);
    }

    public int getCookieExpiresInSecond() {
        return (int) cookieMaxAge.toSeconds();
    }

    public void setCookie(String name, String value) {
        if (value == null) value = "";

        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setDomain("localhost");
        cookie.setSecure(true);
        cookie.setAttribute("SameSite", "Lax"); // TODO: 포트 다를 때 Strict로도 되는지 확인

        if (value.isBlank()) cookie.setMaxAge(0);
        else cookie.setMaxAge((int) cookieMaxAge.toSeconds());

        resp.addCookie(cookie);
    }

    public void deleteCookie(String name) {
        setCookie(name, null);
    }
}
