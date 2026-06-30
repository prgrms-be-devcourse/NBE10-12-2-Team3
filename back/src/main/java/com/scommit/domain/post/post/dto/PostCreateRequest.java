package com.scommit.domain.post.post.dto;

import com.scommit.domain.post.post.entity.PostAccessLevel;
import com.scommit.domain.post.post.entity.PublishStatus;
import org.springframework.lang.Nullable;

// POST /posts 게시글 생성 요청 DTO
// userId는 JWT 토큰에서 추출하므로 포함하지 않음
public record PostCreateRequest(
        @Nullable Long seriesId,
        String title,
        String body,
        String thumbnail,
        PublishStatus publishStatus,
        PostAccessLevel accessLevel
) {}