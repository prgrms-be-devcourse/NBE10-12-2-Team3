package com.scommit.domain.user.user.dto;

import com.scommit.domain.user.user.entity.User;

public record UserProfileResponse(
        Long id,
        int followerCount,
        UserProfileDto profile
) {
    public UserProfileResponse(User user, int followerCount, String profileImageUrl) {
        this(
                user.getId(),
                followerCount,
                new UserProfileDto(user, profileImageUrl)
        );
    }
}
