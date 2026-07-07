package com.scommit.domain.post.like.controller;

import com.scommit.domain.post.like.service.LikeService;
import com.scommit.domain.user.user.entity.User;
import com.scommit.global.dto.RsData;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import com.scommit.global.security.SecurityHelper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/likes")
@RequiredArgsConstructor
@Tag(name = "LikeController", description = "게시글 좋아요 API")
public class LikeController {
    private final LikeService postLikeService;
    private final SecurityHelper securityHelper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "좋아요 추가")
    public RsData<Void> createLike(
            @PathVariable Long postId
    ) {
        User actor = securityHelper.getActor();
        if (actor == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        postLikeService.createLike(postId, actor);
        return new RsData<>("201-1", "좋아요가 추가되었습니다.");
    }

    @DeleteMapping
    @Operation(summary = "좋아요 취소")
    public RsData<Void> deleteLike(
            @PathVariable Long postId
    ) {
        User actor = securityHelper.getActor();
        if (actor == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        postLikeService.deleteLike(postId, actor);
        return new RsData<>("200-1", "좋아요가 취소되었습니다.");
    }
}
