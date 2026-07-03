package com.scommit.domain.series.series.repository;

import com.scommit.domain.series.series.dto.SeriesListResponse;
import com.scommit.domain.series.series.entity.Series;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SeriesRepository extends JpaRepository<Series, Long> {
    Optional<Series> findByIdAndDeletedAtIsNull(Long id);

    @Query("SELECT new com.scommit.domain.series.series.dto.SeriesListResponse(" +
            "s.id, s.user.id, s.user.nickname, s.title, s.body, " +
            "(SELECT COUNT(p.id) FROM Post p WHERE p.series = s AND p.deletedAt IS NULL), " +
            "(SELECT m.url FROM SeriesMedia sm JOIN sm.media m WHERE sm.series = s), " +
            "s.createdAt, s.updatedAt) " +
            "FROM Series s WHERE s.deletedAt IS NULL")
    Slice<SeriesListResponse> findAllWithPostCount(Pageable pageable);

    @Query("SELECT new com.scommit.domain.series.series.dto.SeriesListResponse(" +
            "s.id, s.user.id, s.user.nickname, s.title, s.body, " +
            "(SELECT COUNT(p.id) FROM Post p WHERE p.series = s AND p.deletedAt IS NULL), " +
            "(SELECT m.url FROM SeriesMedia sm JOIN sm.media m WHERE sm.series = s), " +
            "s.createdAt, s.updatedAt) " +
            "FROM Series s WHERE s.user.id = :userId AND s.deletedAt IS NULL")
    Page<SeriesListResponse> findByUserIdWithPostCount(Long userId, Pageable pageable);

    @Query("SELECT new com.scommit.domain.series.series.dto.SeriesListResponse(" +
            "s.id, s.user.id, s.user.nickname, s.title, s.body, " +
            "(SELECT COUNT(p.id) FROM Post p WHERE p.series = s AND p.deletedAt IS NULL), " +
            "(SELECT m.url FROM SeriesMedia sm JOIN sm.media m WHERE sm.series = s), " +
            "s.createdAt, s.updatedAt) " +
            "FROM Series s WHERE s.title LIKE %:keyword% AND s.deletedAt IS NULL")
    Page<SeriesListResponse> findByTitleContainingWithPostCount(String keyword, Pageable pageable);
}
