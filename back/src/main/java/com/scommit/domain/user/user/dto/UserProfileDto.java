package com.scommit.domain.user.user.dto;

import com.scommit.domain.user.user.entity.User;

public record UserProfileDto(
        String nickname,
        String profileImageUrl,
        String introduction
) {
    public UserProfileDto(User user, String profileImageUrl) {
        this(
                user.getNickname(),
                profileImageUrl,
                user.getIntroduction()
        );
    }
}
