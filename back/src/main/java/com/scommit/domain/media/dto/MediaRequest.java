package com.scommit.domain.media.dto;

import jakarta.validation.constraints.NotBlank;
import com.scommit.domain.media.entity.MediaType;

public record MediaRequest(

  Long postId,
  
  @NotBlank(message = "URL을 입력해주세요.")
  String url,
  
  MediaType mediaType
){}