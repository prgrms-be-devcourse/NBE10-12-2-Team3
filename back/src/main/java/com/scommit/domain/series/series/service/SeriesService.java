package com.scommit.domain.series.series.service;

import com.scommit.domain.series.series.dto.SeriesListResponse;
import com.scommit.domain.series.series.dto.SeriesResponse;
import com.scommit.domain.series.series.entity.Series;
import com.scommit.domain.series.series.repository.SeriesRepository;
import com.scommit.domain.user.user.entity.User;
import com.scommit.domain.user.user.entity.UserRole;
import com.scommit.domain.user.user.repository.UserRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SeriesService {
    private final SeriesRepository seriesRepository;
    private final UserRepository userRepository;

    @Transactional
    public SeriesResponse createSeries(String title, String body, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Series series = Series.builder()
                .user(user)
                .title(title)
                .body(body)
                .build();

        return new SeriesResponse(seriesRepository.save(series));
    }

    @Transactional(readOnly = true)
    public Slice<SeriesListResponse> getSeriesSlice(Pageable pageable) {
        return seriesRepository.findAllWithPostCount(pageable);
    }

    @Transactional(readOnly = true)
    public Page<SeriesListResponse> searchSeries(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }
        return seriesRepository.findByTitleContainingWithPostCount(keyword, pageable);
    }

    @Transactional(readOnly = true)
    public Page<SeriesListResponse> getSeriesList(Long creatorId, Pageable pageable) {
        return seriesRepository.findByUserIdWithPostCount(creatorId, pageable);
    }

    @Transactional(readOnly = true)
    public SeriesResponse getSeries(long id) {
        Series series = seriesRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        return new SeriesResponse(series);
    }

    @Transactional
    public SeriesResponse updateSeries(long id, String title, String body, Long actorId, UserRole actorRole) {
        Series series = seriesRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (actorRole != UserRole.ADMIN && !series.getUser().getId().equals(actorId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        series.update(title, body);

        return new SeriesResponse(series);
    }

    @Transactional
    public void deleteSeries(long id, Long actorId, UserRole actorRole) {
        Series series = seriesRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (actorRole != UserRole.ADMIN && !series.getUser().getId().equals(actorId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        series.softDelete();
    }
}
