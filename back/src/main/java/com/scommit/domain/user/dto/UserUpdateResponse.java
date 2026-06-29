package com.scommit.domain.user.dto;

import com.scommit.domain.user.entity.User;

import java.time.LocalDateTime;

public record UserUpdateResponse(
        Long id,
        String email,
        UserProfileDto profile,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public UserUpdateResponse(User user) {
        this(
                user.getId(),
                user.getEmail(),
                new UserProfileDto(user),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
