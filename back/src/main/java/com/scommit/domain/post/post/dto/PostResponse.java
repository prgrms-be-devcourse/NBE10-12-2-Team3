package com.scommit.domain.post.post.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.entity.PostAccessLevel;
import com.scommit.domain.post.post.entity.PublishStatus;

import java.time.LocalDateTime;

// GET /posts/{id} 게시글 상세 조회 응답 DTO
// User, Series 객체 대신 id만 반환 → 순환참조 방지
// 엔티티 → DTO 변환 로직을 생성자 안에 포함
public record PostResponse(
        Long id,
        Long userId,
        String nickname,
        Long seriesId,
        String title,
        String body,
        PublishStatus publishStatus,
        PostAccessLevel accessLevel,
        Long viewCount,
        Long likeCount,
        Long bookmarkCount,
        @JsonProperty("isLocked") boolean isLocked,
        @JsonProperty("isLiked") boolean isLiked,
        @JsonProperty("isBookmarked") boolean isBookmarked,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public PostResponse(Post post) {
        this(
                post.getId(),
                post.getUser().getId(),
                post.getUser().getNickname(),
                post.getSeries() != null ? post.getSeries().getId() : null,
                post.getTitle(),
                post.getBody(),
                post.getPublishStatus(),
                post.getAccessLevel(),
                post.getViewCount(),
                post.getLikeCount(),
                post.getBookmarkCount(),
                false,
                false,
                false,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }

    public PostResponse(Post post, boolean isLocked, boolean isLiked, boolean isBookmarked) {
        this(
                post.getId(),
                post.getUser().getId(),
                post.getUser().getNickname(),
                post.getSeries() != null ? post.getSeries().getId() : null,
                post.getTitle(),
                isLocked ? null : post.getBody(),
                post.getPublishStatus(),
                post.getAccessLevel(),
                post.getViewCount(),
                post.getLikeCount(),
                post.getBookmarkCount(),
                isLocked,
                isLiked,
                isBookmarked,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
