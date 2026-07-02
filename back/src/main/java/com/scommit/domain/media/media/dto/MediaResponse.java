package com.scommit.domain.media.media.dto;

import com.scommit.domain.media.media.entity.Media;
import com.scommit.domain.media.media.entity.MediaType;

public record MediaResponse(
  Long id,
  String url,
  MediaType type
){
  public MediaResponse(Media meida){
    this(
      meida.getId(),
      meida.getUrl(),
      meida.getType()
    );
  }
}