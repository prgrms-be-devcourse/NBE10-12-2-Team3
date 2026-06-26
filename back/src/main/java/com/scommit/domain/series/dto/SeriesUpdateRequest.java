package com.scommit.domain.series.dto;

import jakarta.validation.constraints.NotBlank;

public record SeriesUpdateRequest(
  @NotBlank(message = "제목은 필수입니다.")
  String title,
  
  String body
){}
