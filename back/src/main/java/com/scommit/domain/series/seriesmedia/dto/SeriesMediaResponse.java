package com.scommit.domain.series.seriesmedia.dto;

import com.scommit.domain.media.media.entity.MediaType;
import com.scommit.domain.series.seriesmedia.entity.SeriesMedia;

public record SeriesMediaResponse(
        Long id,
        Long seriesId,
        String url,
        MediaType mediaType
) {
    public SeriesMediaResponse(SeriesMedia seriesMedia) {
        this(
                seriesMedia.getId(),
                seriesMedia.getSeries().getId(),
                seriesMedia.getMedia().getUrl(),
                seriesMedia.getMedia().getType()
        );
    }
}
