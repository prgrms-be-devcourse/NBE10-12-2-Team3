package com.scommit.domain.media.controller;

import com.scommit.domain.media.dto.MediaResponse;
import com.scommit.domain.media.entity.Media;
import com.scommit.domain.media.service.MediaService;
import com.scommit.global.dto.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@Tag(name = "MediaController", description = "API 미디어 컨트롤러")
public class MediaController {

    private final MediaService mediaService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "새 미디어 생성")
    public RsData<MediaResponse> createMedia(
            @RequestParam("postId") Long postId,
            @RequestPart("file") MultipartFile file
    ) {
        Media media = mediaService.create(postId, file);

        return new RsData<>("201-1", "미디어를 생성하였습니다.", new MediaResponse(media));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "미디어 삭제")
    public RsData<Void> deleteMedia(
            @PathVariable long id
    ) {
        mediaService.delete(id);

        return new RsData<>("204-1", "미디어가 삭제되었습니다.");
        }
}
