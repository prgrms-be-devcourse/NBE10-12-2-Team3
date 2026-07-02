package com.scommit.domain.series.seriesmedia.entity;

import com.scommit.domain.media.media.entity.Media;
import com.scommit.domain.series.series.entity.Series;
import com.scommit.global.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "series_media")
public class SeriesMedia extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "series_id", nullable = false, unique = true)
    private Series series;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", nullable = false)
    private Media media;

    @Builder
    public SeriesMedia(Series series, Media media) {
        this.series = series;
        this.media = media;
    }

    public void updateMedia(Media media) {
        this.media = media;
    }
}