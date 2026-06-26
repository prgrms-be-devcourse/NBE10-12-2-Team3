package com.scommit.domain.series.repository;

import com.scommit.domain.series.entity.Series;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeriesRepository extends JpaRepository<Series, Long> {
    @EntityGraph(attributePaths = {"user"})
    Page<Series> findAllByDeletedAtIsNull(Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    Page<Series> findByUserIdAndDeletedAtIsNull(Long userId, Pageable pageable);
}



