package com.scommit.domain.post.post.dto;

import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.entity.PostAccessLevel;
import com.scommit.domain.post.post.entity.PublishStatus;

import java.time.LocalDateTime;

// GET /posts 게시글 목록 조회 응답 DTO
// GET /posts?creatorId={id} 특정 유저 게시글 목록 조회에도 재사용
// body 제외 → 목록에서 본문까지 전송하면 데이터 낭비
public record PostListResponse(
        Long id,
        Long userId,
        Long seriesId,
        String title,
        String thumbnail,
        PublishStatus publishStatus,
        PostAccessLevel accessLevel,
        Long viewCount,
        LocalDateTime createdAt
) {
    public PostListResponse(Post post) {
        this(
                post.getId(),
                post.getUser() != null ? post.getUser().getId() : null, // TODO: 유저 연동 완료 후 null 체크 제거
                post.getSeries() != null ? post.getSeries().getId() : null,
                post.getTitle(),
                post.getThumbnail(),
                post.getPublishStatus(),
                post.getAccessLevel(),
                post.getViewCount(),
                post.getCreatedAt()
        );
    }
}
