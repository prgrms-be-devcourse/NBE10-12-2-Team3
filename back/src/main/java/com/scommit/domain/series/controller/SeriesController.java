package com.scommit.domain.series.controller;

import com.scommit.domain.series.dto.SeriesListResponse;
import com.scommit.domain.series.dto.SeriesCreateRequest;
import com.scommit.domain.series.dto.SeriesUpdateRequest;
import com.scommit.domain.series.dto.SeriesResponse;
import com.scommit.domain.series.entity.Series;
import com.scommit.domain.series.service.SeriesService;
import com.scommit.global.dto.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/series")
@RequiredArgsConstructor
@Tag(name = "SeriesController", description = "API 시리즈 컨트롤러")
public class SeriesController {
    private final SeriesService seriesService;

    @GetMapping
    @Operation(summary = "시리즈 전체 조회")
    public RsData<Page<SeriesListResponse>> getSeriesList(
            @RequestParam(required = false) Long creatorId,
            @RequestParam(defaultValue = "0") int page
    ) {
        Page<Series> seriesPage = seriesService.findAll(creatorId, page);
        Page<SeriesListResponse> responses = seriesPage.map(SeriesListResponse::new);

        return new RsData<>("200-1", "시리즈를 전체 조회하였습니다.", responses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "시리즈 상세 조회")
    public RsData<SeriesResponse> getSeries(
            @PathVariable long id
    ) {
        Series series = seriesService.findById(id);

        return new RsData<>("200-1", "시리즈를 상세 조회하였습니다.", new SeriesResponse(series));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "새 시리즈 생성")
    public RsData<SeriesResponse> createSeries(
            @RequestBody @Valid SeriesCreateRequest request
    ) {
        Series series = seriesService.create(request);

        return new RsData<>("201-1", "시리즈를 생성하였습니다.", new SeriesResponse(series));
    }

    @PutMapping("/{id}")
    @Operation(summary = "시리즈 수정")
    public RsData<SeriesResponse> updateSeries(
            @PathVariable long id,
            @RequestBody @Valid SeriesUpdateRequest request
    ) {
        Series series = seriesService.update(id, request);

        return new RsData<>("200-1", "시리즈를 수정하였습니다.", new SeriesResponse(series));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "시리즈 삭제")
    public RsData<Void> deleteSeries(
            @PathVariable long id
    ) {
        seriesService.delete(id);

        return new RsData<>("204-1", "시리즈가 삭제되었습니다.");
    }
}

