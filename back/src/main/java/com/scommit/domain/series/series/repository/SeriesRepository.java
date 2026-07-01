package com.scommit.domain.series.series.repository;

import com.scommit.domain.series.series.entity.Series;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SeriesRepository extends JpaRepository<Series, Long> {
    Optional<Series> findByIdAndDeletedAtIsNull(Long id);

    Page<Series> findAllByDeletedAtIsNull(Pageable pageable);

    Page<Series> findByUserIdAndDeletedAtIsNull(Long userId, Pageable pageable);
}



