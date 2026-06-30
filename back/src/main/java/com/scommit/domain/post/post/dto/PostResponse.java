package com.scommit.domain.post.post.dto;

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
        Long seriesId,
        String title,
        String body,
        String thumbnail,
        PublishStatus publishStatus,
        PostAccessLevel accessLevel,
        Long viewCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public PostResponse(Post post) {
        this(
                post.getId(),
                post.getUser() != null ? post.getUser().getId() : null, // TODO: 유저 연동 완료 후 null 체크 제거
                post.getSeries() != null ? post.getSeries().getId() : null,
                post.getTitle(),
                post.getBody(),
                post.getThumbnail(),
                post.getPublishStatus(),
                post.getAccessLevel(),
                post.getViewCount(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
