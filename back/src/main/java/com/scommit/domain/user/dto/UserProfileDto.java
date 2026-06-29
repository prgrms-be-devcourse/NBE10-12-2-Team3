package com.scommit.domain.user.dto;

import com.scommit.domain.user.entity.User;

public record UserProfileDto(
        String nickname,
        String profileImage,
        String introduction
) {
    public UserProfileDto(User user) {
        this(
                user.getNickname(),
                user.getProfileImage(),
                user.getIntroduction()
        );
    }
}
