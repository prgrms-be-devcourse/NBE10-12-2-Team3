package com.scommit.domain.post.comment.controller;

import com.scommit.domain.post.comment.dto.CommentCreateRequest;
import com.scommit.domain.post.comment.dto.CommentResponse;
import com.scommit.domain.post.comment.dto.CommentUpdateRequest;
import com.scommit.domain.post.comment.service.CommentService;
import com.scommit.global.dto.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Comment", description = "댓글 관련 API")
@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "댓글 작성", description = "게시글에 댓글을 작성합니다.")
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public RsData<CommentResponse> createComment(
            @PathVariable Long postId,
            @RequestBody CommentCreateRequest request) {
        CommentResponse response = commentService.createComment(postId, request.body());
        return new RsData<>("201-1", "댓글이 작성되었습니다.", response);
    }

    @Operation(summary = "댓글 전체 조회", description = "특정 게시글의 댓글 목록을 조회합니다.")
    @GetMapping
    public RsData<List<CommentResponse>> getComments(
            @PathVariable Long postId) {
        List<CommentResponse> response = commentService.getComments(postId);
        return new RsData<>("200-1", "댓글 목록입니다.", response);
    }

    @Operation(summary = "댓글 수정", description = "댓글을 수정합니다.")
    @PutMapping("/{id}")
    public RsData<CommentResponse> updateComment(
            @PathVariable Long postId,
            @PathVariable Long id,
            @RequestBody CommentUpdateRequest request) {
        CommentResponse response = commentService.updateComment(id, request.body());
        return new RsData<>("200-1", "댓글이 수정되었습니다.", response);
    }

    @Operation(summary = "댓글 삭제", description = "댓글을 삭제합니다.")
    @DeleteMapping("/{id}")
    public RsData<Void> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long id) {
        commentService.deleteComment(id);
        return new RsData<>("200-1", "댓글이 삭제되었습니다.");
    }
}
