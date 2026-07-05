package com.scommit.domain.post.bookmark.controller;

import com.scommit.domain.post.bookmark.service.BookmarkService;
import com.scommit.domain.post.post.dto.PostListResponse;
import com.scommit.domain.user.user.entity.User;
import com.scommit.global.dto.PageResponse;
import com.scommit.global.dto.RsData;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import com.scommit.global.security.SecurityHelper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "BookmarkController", description = "게시글 북마크 API")
public class BookmarkController {
    private final BookmarkService postBookmarkService;
    private final SecurityHelper securityHelper;

    @PostMapping("/posts/{postId}/bookmarks")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "북마크 추가")
    public RsData<Void> createBookmark(
            @PathVariable Long postId
    ) {
        User actor = securityHelper.getActor();
        if (actor == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        postBookmarkService.createBookmark(postId, actor);
        return new RsData<>("201-1", "북마크가 추가되었습니다.");
    }

    @GetMapping("/bookmarks/me")
    @Operation(summary = "내 북마크 목록 조회")
    public RsData<PageResponse<PostListResponse>> getMyBookmarks(
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        User actor = securityHelper.getActor();
        if (actor == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        PageResponse<PostListResponse> response = new PageResponse<>(postBookmarkService.getMyBookmarks(actor, pageable));
        return new RsData<>("200-1", "북마크한 게시글 목록입니다.", response);
    }

    @DeleteMapping("/posts/{postId}/bookmarks")
    @Operation(summary = "북마크 취소")
    public RsData<Void> deleteBookmark(
            @PathVariable Long postId
    ) {
        User actor = securityHelper.getActor();
        if (actor == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        postBookmarkService.deleteBookmark(postId, actor);
        return new RsData<>("200-1", "북마크가 취소되었습니다.");
    }
}
