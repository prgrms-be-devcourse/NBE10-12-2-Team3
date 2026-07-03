package com.scommit.domain.series.series.dto;

import java.time.LocalDateTime;

public record SeriesListResponse(
        Long id,
        Long userId,
        String nickname,
        String title,
        String body,
        Long postCount,
        String thumbnailUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
