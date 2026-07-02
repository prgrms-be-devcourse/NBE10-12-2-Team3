package com.scommit.domain.series.series.controller;

import com.scommit.domain.series.series.dto.SeriesCreateRequest;
import com.scommit.domain.series.series.dto.SeriesListResponse;
import com.scommit.domain.series.series.dto.SeriesResponse;
import com.scommit.domain.series.series.dto.SeriesUpdateRequest;
import com.scommit.domain.series.series.entity.Series;
import com.scommit.domain.series.series.service.SeriesService;
import com.scommit.domain.series.seriesmedia.dto.SeriesMediaResponse;
import com.scommit.domain.series.seriesmedia.service.SeriesMediaService;
import com.scommit.global.dto.PageResponse;
import com.scommit.global.dto.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/series")
@RequiredArgsConstructor
@Tag(name = "SeriesController", description = "API 시리즈 컨트롤러")
public class SeriesController {
    private final SeriesService seriesService;
    private final SeriesMediaService seriesMediaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "새 시리즈 생성")
    public RsData<SeriesResponse> createSeries(
            @RequestBody @Valid SeriesCreateRequest request
    ) {
        Series series = seriesService.createSeries(request.title(), request.body(), request.userId());

        return new RsData<>("201-1", "시리즈를 생성하였습니다.", new SeriesResponse(series));
    }

    @GetMapping
    @Operation(summary = "시리즈 전체 조회")
    public RsData<PageResponse<SeriesListResponse>> getSeriesList(
            @RequestParam(required = false) Long creatorId,
            @RequestParam(defaultValue = "0") int page
    ) {
        Page<Series> seriesPage = seriesService.getSeriesList(creatorId, page);
        Page<SeriesListResponse> responses = seriesPage.map(SeriesListResponse::new);

        return new RsData<>("200-1", "시리즈를 전체 조회하였습니다.", new PageResponse<>(responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "시리즈 상세 조회")
    public RsData<SeriesResponse> getSeries(
            @PathVariable long id
    ) {
        Series series = seriesService.getSeries(id);

        return new RsData<>("200-1", "시리즈를 상세 조회하였습니다.", new SeriesResponse(series));
    }

    @PutMapping("/{id}")
    @Operation(summary = "시리즈 수정")
    public RsData<SeriesResponse> updateSeries(
            @PathVariable long id,
            @RequestBody @Valid SeriesUpdateRequest request
    ) {
        Series series = seriesService.updateSeries(id, request.title(), request.body());

        return new RsData<>("200-1", "시리즈를 수정하였습니다.", new SeriesResponse(series));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "시리즈 삭제")
    public RsData<Void> deleteSeries(
            @PathVariable long id
    ) {
        seriesService.deleteSeries(id);

        return new RsData<>("200-1", "시리즈가 삭제되었습니다.");
    }

    @PostMapping(value = "/{id}/medias", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "시리즈 썸네일 생성")
    public RsData<SeriesMediaResponse> uploadMedia(
            @PathVariable Long id,
            @RequestPart MultipartFile file) {
        SeriesMediaResponse response = seriesMediaService.uploadMedia(id, file);
        return new RsData<>("201-1", "썸네일을 생성하였습니다.", response);
    }

    @GetMapping("/{id}/medias")
    @Operation(summary = "시리즈 썸네일 조회")
    public RsData<SeriesMediaResponse> getMedia(
            @PathVariable Long id
    ) {
        SeriesMediaResponse response = seriesMediaService.getMedia(id);
        return new RsData<>("200-1", "썸네일을 조회하였습니다.", response);
    }

    @DeleteMapping("/{id}/medias")
    @Operation(summary = "시리즈 썸네일 삭제")
    public RsData<Void> deleteMedia(
            @PathVariable Long id
    ) {
        seriesMediaService.deleteMedia(id);
        return new RsData<>("200-1", "썸네일이 삭제되었습니다.");
    }
}

