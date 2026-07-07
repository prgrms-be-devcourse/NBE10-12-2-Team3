package com.scommit.domain.series.series.controller;

import com.scommit.domain.post.post.dto.PostListResponse;
import com.scommit.domain.post.post.service.PostService;
import com.scommit.domain.series.series.dto.SeriesCreateRequest;
import com.scommit.domain.series.series.dto.SeriesListResponse;
import com.scommit.domain.series.series.dto.SeriesResponse;
import com.scommit.domain.series.series.dto.SeriesUpdateRequest;
import com.scommit.domain.series.series.service.SeriesService;
import com.scommit.domain.series.seriesmedia.dto.SeriesMediaResponse;
import com.scommit.domain.series.seriesmedia.service.SeriesMediaService;
import com.scommit.domain.user.user.entity.User;
import com.scommit.global.dto.PageResponse;
import com.scommit.global.dto.RsData;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import com.scommit.global.security.SecurityHelper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/series")
@RequiredArgsConstructor
@Tag(name = "SeriesController", description = "API 시리즈 컨트롤러")
public class SeriesController {
    private final SeriesService seriesService;
    private final SeriesMediaService seriesMediaService;
    private final PostService postService;
    private final SecurityHelper securityHelper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "새 시리즈 생성")
    public RsData<SeriesResponse> createSeries(
            @RequestBody @Valid SeriesCreateRequest request
    ) {
        User actor = securityHelper.getActor();
        if (actor == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        SeriesResponse response = seriesService.createSeries(request.title(), request.body(), actor.getId());
        return new RsData<>("201-1", "시리즈를 생성하였습니다.", response);
    }

    @GetMapping
    @Operation(summary = "시리즈 전체 조회")
    public RsData<Slice<SeriesListResponse>> getSeriesList(
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Slice<SeriesListResponse> response = seriesService.getSeriesSlice(pageable);
        return new RsData<>("200-1", "시리즈를 전체 조회하였습니다.", response);
    }

    @GetMapping("/search")
    @Operation(summary = "시리즈 제목 검색")
    public RsData<PageResponse<SeriesListResponse>> searchSeries(
            @RequestParam String keyword,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<SeriesListResponse> response = new PageResponse<>(seriesService.searchSeries(keyword, pageable));
        return new RsData<>("200-1", "시리즈 검색 결과입니다.", response);
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "특정 유저 시리즈 조회")
    public RsData<PageResponse<SeriesListResponse>> getUserSeriesList(
            @PathVariable Long userId,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<SeriesListResponse> response = new PageResponse<>(seriesService.getSeriesList(userId, pageable));
        return new RsData<>("200-1", "유저 시리즈를 조회하였습니다.", response);
    }

    @GetMapping("/me")
    @Operation(summary = "내 시리즈 조회")
    public RsData<PageResponse<SeriesListResponse>> getMySeriesList(
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        User actor = securityHelper.getActor();
        if (actor == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        PageResponse<SeriesListResponse> response = new PageResponse<>(seriesService.getSeriesList(actor.getId(), pageable));
        return new RsData<>("200-1", "내 시리즈를 조회하였습니다.", response);
    }

    @GetMapping("/{id}/posts")
    @Operation(summary = "시리즈 내 게시글 목록 조회")
    public RsData<List<PostListResponse>> getSeriesPosts(
            @PathVariable long id
    ) {
        User actor = securityHelper.getActor();
        List<PostListResponse> response = postService.getPostsBySeriesId(id, actor);
        return new RsData<>("200-1", "시리즈 게시글 목록입니다.", response);
    }

    @PostMapping("/{id}/posts/{postId}")
    @Operation(summary = "시리즈에 포스트 추가")
    public RsData<Void> addPostToSeries(
            @PathVariable Long id,
            @PathVariable Long postId
    ) {
        User actor = securityHelper.getActor();
        if (actor == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        postService.addPostToSeries(postId, id, actor);
        return new RsData<>("200-1", "포스트가 시리즈에 추가되었습니다.");
    }

    @DeleteMapping("/{id}/posts/{postId}")
    @Operation(summary = "시리즈에서 포스트 제거")
    public RsData<Void> removePostFromSeries(
            @PathVariable Long id,
            @PathVariable Long postId
    ) {
        User actor = securityHelper.getActor();
        if (actor == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        postService.removePostFromSeries(postId, id, actor);
        return new RsData<>("200-1", "포스트가 시리즈에서 제거되었습니다.");
    }

    @GetMapping("/{id}")
    @Operation(summary = "시리즈 상세 조회")
    public RsData<SeriesResponse> getSeries(
            @PathVariable long id
    ) {
        SeriesResponse response = seriesService.getSeries(id);
        return new RsData<>("200-1", "시리즈를 상세 조회하였습니다.", response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "시리즈 수정")
    public RsData<SeriesResponse> updateSeries(
            @PathVariable long id,
            @RequestBody @Valid SeriesUpdateRequest request
    ) {
        User actor = securityHelper.getActor();
        if (actor == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        SeriesResponse response = seriesService.updateSeries(id, request.title(), request.body(), actor.getId(), actor.getRole());
        return new RsData<>("200-1", "시리즈를 수정하였습니다.", response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "시리즈 삭제")
    public RsData<Void> deleteSeries(
            @PathVariable long id
    ) {
        User actor = securityHelper.getActor();
        if (actor == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        seriesService.deleteSeries(id, actor.getId(), actor.getRole());
        return new RsData<>("200-1", "시리즈가 삭제되었습니다.");
    }

    @PostMapping(value = "/{id}/medias", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "시리즈 썸네일 생성")
    public RsData<SeriesMediaResponse> uploadMedia(
            @PathVariable Long id,
            @RequestPart MultipartFile file) {
        User actor = securityHelper.getActor();
        if (actor == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        SeriesMediaResponse response = seriesMediaService.uploadMedia(id, file, actor.getId(), actor.getRole());
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
        User actor = securityHelper.getActor();
        if (actor == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        seriesMediaService.deleteMedia(id, actor.getId(), actor.getRole());
        return new RsData<>("200-1", "썸네일이 삭제되었습니다.");
    }
}

