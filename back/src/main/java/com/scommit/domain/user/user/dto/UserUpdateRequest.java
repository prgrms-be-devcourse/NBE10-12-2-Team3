package com.scommit.domain.user.user.dto;

import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @Size(min = 2, max = 20, message = "닉네임은 최소 2자에서 최대 20자 사이입니다.")
        String nickname,

        String profileImage,

        @Size(max = 100, message = "소개글은 100자 이내로 입력하셔야 합니다.")
        String introduction
) {}
