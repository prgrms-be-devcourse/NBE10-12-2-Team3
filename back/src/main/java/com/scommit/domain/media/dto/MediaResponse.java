package com.scommit.domain.media.dto;

import com.scommit.domain.media.entity.Media;
import com.scommit.domain.media.entity.MediaType;

public record MediaResponse(
  Long id,
  Long postId,
  String url,
  MediaType type
){
  public MediaResponse(Media meida){
    this(
      meida.getId(),
      meida.getPost().getId(),
      meida.getUrl(),
      meida.getType()
    );
  }
}