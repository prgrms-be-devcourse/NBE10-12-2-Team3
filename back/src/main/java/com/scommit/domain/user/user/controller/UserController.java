package com.scommit.domain.user.user.controller;

import com.scommit.domain.user.user.dto.LoginRequest;
import com.scommit.domain.user.user.dto.LoginResponse;
import com.scommit.domain.user.user.dto.SignupRequest;
import com.scommit.domain.user.user.dto.SignupResponse;
import com.scommit.domain.user.user.entity.User;
import com.scommit.domain.user.user.service.UserService;
import com.scommit.global.dto.RsData;
import com.scommit.global.security.SecurityHelper;
import com.scommit.global.security.jwt.JwtProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "UserController", description = "API 유저 컨트롤러")
public class UserController {
    private final UserService userService;
    private final JwtProvider jwtProvider;
    private final SecurityHelper securityHelper;

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "회원가입", description = "신규 유저가 회원가입합니다.")
    public RsData<SignupResponse> signUp(
            @Valid @RequestBody SignupRequest request
    ) {
        User user = userService.signUp(request.email(), request.password(), request.nickname());
        return new RsData<>(
                "201-1",
                "회원가입에 성공했습니다.",
                new SignupResponse(user)
        );
    }

    @PostMapping("/login")
    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인합니다.")
    public RsData<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        User user = userService.login(request.email(), request.password());
        String accessToken = jwtProvider.generateAccessToken(user.getId(), user.getEmail(), user.getNickname(), user.getRole());

        securityHelper.setCookie("accessToken", accessToken);
        securityHelper.setCookie("refreshToken", user.getRefreshToken());

        return new RsData<>(
                "200-1",
                "로그인에 성공했습니다.",
                new LoginResponse(accessToken, user.getRefreshToken(), 0, user)
        );
    }

}
