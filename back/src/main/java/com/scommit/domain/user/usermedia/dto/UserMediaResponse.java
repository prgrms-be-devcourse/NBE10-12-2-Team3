package com.scommit.domain.user.usermedia.dto;

import com.scommit.domain.media.media.entity.MediaType;
import com.scommit.domain.user.usermedia.entity.UserMedia;

public record UserMediaResponse(
        Long id,
        Long userId,
        String url,
        MediaType mediaType
) {
    public UserMediaResponse(UserMedia userMedia) {
        this(
                userMedia.getId(),
                userMedia.getUser().getId(),
                userMedia.getMedia().getUrl(),
                userMedia.getMedia().getType()
        );
    }
}
