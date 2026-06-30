package com.scommit.domain.user.user.dto;

import com.scommit.domain.user.user.entity.User;

import java.time.LocalDateTime;

public record SignupResponse(
        Long id,
        String email,
        String nickname,
        LocalDateTime createdAt
) {
    public SignupResponse(User user) {
        this(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getCreatedAt()
        );
    }
}
