package com.scommit.domain.post.postmedia.dto;

import com.scommit.domain.media.media.entity.MediaType;
import com.scommit.domain.post.postmedia.entity.PostMedia;
import com.scommit.domain.post.postmedia.entity.PostMediaType;

public record PostMediaResponse(
        Long id,
        Long postId,
        String url,
        MediaType mediaType,
        PostMediaType type
) {
    public PostMediaResponse(PostMedia postMedia) {
        this(
                postMedia.getId(),
                postMedia.getPost().getId(),
                postMedia.getMedia().getUrl(),
                postMedia.getMedia().getType(),
                postMedia.getType()
        );
    }
}
