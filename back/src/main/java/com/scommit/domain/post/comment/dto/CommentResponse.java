package com.scommit.domain.post.comment.dto;

import com.scommit.domain.post.comment.entity.Comment;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long postId,
        Long userId,
        String nickname,
        String body,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public CommentResponse(Comment comment) {
        this(
                comment.getId(),
                comment.getPost().getId(),
                comment.getUser().getId(),
                comment.getUser().getNickname(),
                comment.getBody(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}
