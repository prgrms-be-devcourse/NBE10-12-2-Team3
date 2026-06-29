package com.scommit.domain.user.dto;

import com.scommit.domain.user.entity.User;

public record UserProfileResponse(
        Long id,
        UserProfileDto profile
) {
    public UserProfileResponse(User user) {
        this(
                user.getId(),
                new UserProfileDto(user)
        );
    }
}
