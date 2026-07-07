package com.scommit.domain.user.user.dto;

import com.scommit.domain.user.user.entity.User;

public record UserSearchResponse(
        Long id,
        String nickname,
        String introduction
) {
    public UserSearchResponse(User user) {
        this(user.getId(), user.getNickname(), user.getIntroduction());
    }
}
