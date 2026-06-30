package com.scommit.domain.user.user.dto;

import com.scommit.domain.user.user.entity.User;

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
