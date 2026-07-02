package com.scommit.domain.user.user.dto;

import com.scommit.domain.user.user.entity.User;

public record UserProfileDto(
        String nickname,
        String profileImage,
        String introduction
) {
    public UserProfileDto(User user, String profileImage) {
        this(
                user.getNickname(),
                profileImage,
                user.getIntroduction()
        );
    }
}
