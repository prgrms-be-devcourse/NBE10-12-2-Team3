package com.scommit.domain.user.user.dto;

import jakarta.validation.constraints.NotBlank;

public record UserDeleteRequest(
        @NotBlank(message = "비밀번호를 입력해주세요.")
        String password
) {}
