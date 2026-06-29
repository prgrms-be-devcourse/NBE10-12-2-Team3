package com.scommit.domain.series.dto;

import com.scommit.domain.series.entity.Series;
import java.time.LocalDateTime;

public record SeriesResponse(
  Long id,
  Long userId,
  String title,
  String body,
  LocalDateTime createdAt,
  LocalDateTime updatedAt
){
  public SeriesResponse(Series series){
    this(
      series.getId(),
      series.getUser().getId(),
      series.getTitle(),
      series.getBody(),
      series.getCreatedAt(),
      series.getUpdatedAt()
    );
  }
}
