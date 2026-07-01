package com.scommit.domain.user.user.dto;

import com.scommit.domain.user.user.entity.User;

public record UserProfileDto(
        String nickname,
        String introduction
) {
    public UserProfileDto(User user) {
        this(
                user.getNickname(),
                user.getIntroduction()
        );
    }
}
