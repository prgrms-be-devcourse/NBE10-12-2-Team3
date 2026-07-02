package com.scommit.domain.user.user.controller;

import com.scommit.domain.user.user.dto.LoginRequest;
import com.scommit.domain.user.user.dto.LoginResponse;
import com.scommit.domain.user.user.dto.SignupRequest;
import com.scommit.domain.user.user.dto.SignupResponse;
import com.scommit.domain.user.user.entity.User;
import com.scommit.domain.user.user.service.UserService;
import com.scommit.domain.user.usermedia.dto.UserMediaResponse;
import com.scommit.domain.user.usermedia.service.UserMediaService;
import com.scommit.global.dto.RsData;
import com.scommit.global.security.SecurityHelper;
import com.scommit.global.security.jwt.JwtProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "UserController", description = "API 유저 컨트롤러")
public class UserController {
    private final UserService userService;
    private final JwtProvider jwtProvider;
    private final SecurityHelper securityHelper;
    private final UserMediaService userMediaService;

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
                new LoginResponse(accessToken, user.getRefreshToken(), securityHelper.getCookieExpiresInSecond(), user)
        );
    }

    @PostMapping(value = "/{id}/medias", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "프로필 이미지 생성")
    public RsData<UserMediaResponse> uploadMedia(
            @PathVariable Long id,
            @RequestPart MultipartFile file
    ) {
        UserMediaResponse response = userMediaService.uploadMedia(id, file);
        return new RsData<>("201-1", "프로필 이미지를 생성하였습니다.", response);
    }

    @GetMapping("/{id}/medias")
    @Operation(summary = "프로필 이미지 조회")
    public RsData<UserMediaResponse> getMedia(
            @PathVariable Long id
    ) {
        UserMediaResponse response = userMediaService.getMedia(id);
        return new RsData<>("200-1", "프로필 이미지를 조회하였습니다.", response);
    }

    @DeleteMapping("/{id}/medias")
    @Operation(summary = "프로필 이미지 삭제")
    public RsData<Void> deleteMedia(
            @PathVariable Long id
    ) {
        userMediaService.deleteMedia(id);
        return new RsData<>("200-1", "프로필 이미지가 삭제되었습니다.");
    }

}
