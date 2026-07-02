package com.scommit.domain.series.seriesmedia.repository;

import com.scommit.domain.series.series.entity.Series;
import com.scommit.domain.series.seriesmedia.entity.SeriesMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SeriesMediaRepository extends JpaRepository<SeriesMedia, Long> {
    Optional<SeriesMedia> findBySeries(Series series);
}
