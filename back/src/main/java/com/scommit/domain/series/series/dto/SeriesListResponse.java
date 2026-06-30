package com.scommit.domain.series.series.dto;

import com.scommit.domain.series.series.entity.Series;

import java.time.LocalDateTime;

public record SeriesListResponse(
        Long id,
        Long userId,
        String title,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public SeriesListResponse(Series series) {
        this(
                series.getId(),
                series.getUser().getId(),
                series.getTitle(),
                series.getCreatedAt(),
                series.getUpdatedAt()
        );
    }
}
