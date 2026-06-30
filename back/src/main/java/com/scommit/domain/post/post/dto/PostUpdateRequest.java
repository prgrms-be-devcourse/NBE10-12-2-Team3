package com.scommit.domain.post.post.dto;

import com.scommit.domain.post.post.entity.PostAccessLevel;
import com.scommit.domain.post.post.entity.PublishStatus;
import org.springframework.lang.Nullable;

// PUT /posts/{id} 게시글 수정 요청 DTO
// Create와 필드가 같지만 역할을 명확히 분리
public record PostUpdateRequest(
        @Nullable Long seriesId,
        String title,
        String body,
        String thumbnail,
        PublishStatus publishStatus,
        PostAccessLevel accessLevel
) {}