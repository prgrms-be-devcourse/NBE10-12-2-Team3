package com.scommit.domain.series.service;

import com.scommit.domain.series.dto.SeriesCreateRequest;
import com.scommit.domain.series.dto.SeriesUpdateRequest;
import com.scommit.domain.series.entity.Series;
import com.scommit.domain.series.repository.SeriesRepository;
import com.scommit.domain.user.entity.User;
import com.scommit.domain.user.repository.UserRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SeriesService {
    private final SeriesRepository seriesRepository;
    private final UserRepository userRepository;

    @Transactional
    public Series create(SeriesCreateRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Series series = Series.builder()
                .user(user)
                .title(request.title())
                .body(request.body())
                .build();

        return seriesRepository.save(series);
    }

    // TODO: 어드민은 소프트 딜리트 데이터도 열람가능하는 로직
    public Page<Series> findAll(Long creatorId, int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("id").descending());

        if (creatorId != null) {
            return seriesRepository.findByUserIdAndDeletedAtIsNull(creatorId, pageable);
        }

        return seriesRepository.findAllByDeletedAtIsNull(pageable);
    }

    // TODO: 어드민은 소프트 딜리트 데이터도 열람가능하는 로직
    public Series findById(long id) {
        Series series = seriesRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (series.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        return series;
    }

    // TODO: 작성자나 어드민만 되도록 하는 로직
    @Transactional
    public Series update(long id, SeriesUpdateRequest request) {
        Series series = seriesRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (series.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        series.update(request.title(), request.body());

        return series;
    }

    // TODO: 나중에 작성자 본인이나 어드민만 글 삭제할 수 있게 체크
    @Transactional
    public void delete(long id) {
        Series series = seriesRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (series.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        series.softDelete();
    }
}


