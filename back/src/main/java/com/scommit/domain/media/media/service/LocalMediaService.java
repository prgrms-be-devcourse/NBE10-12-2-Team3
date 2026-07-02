package com.scommit.domain.media.media.service;

import com.scommit.domain.media.media.entity.Media;
import com.scommit.domain.media.media.entity.MediaType;
import com.scommit.domain.media.media.repository.MediaRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocalMediaService implements MediaService {
    private final MediaRepository mediaRepository;

    @Value("${file.path}")
    private String mediaPath;

    // 이름 중복 방지용으로 미디어 이름 앞에 UUID 추가하는 메서드
    private static String addUUID(String originalFilename) {
        return UUID.randomUUID().toString().replace("-", "") + "_" + originalFilename;
    }

    // 미디어를 생성하는 메서드
    @Transactional
    public Media uploadMedia(MultipartFile file, String category) {


        if(file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        String mediaUrl = category + "/" + addUUID(file.getOriginalFilename());

        MediaType mediaType = getMediaType(file.getContentType());

        try {
            uploadFile(file, mediaUrl);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        return saveMedia(mediaUrl, mediaType);
    }

    // 미디어를 삭제하는 메서드
    @Transactional
    public void deleteMedia(Long mediaId) {
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        mediaRepository.delete(media);

        deleteFile(media.getUrl());
    }

    // 미디어가 올바른 형식인지 검사하는 메서드
    private MediaType getMediaType(String mediaType) {
        if (mediaType == null) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }
        else if (mediaType.startsWith("image/")) {
            return MediaType.IMAGE;
        }
        else if (mediaType.startsWith("video/")) {
            return MediaType.VIDEO;
        }
        else {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }
    }

    // 미디어 파일을 삭제하는 메서드
    private void deleteFile(String mediaName) {
        try {
            String deletePath = mediaPath + mediaName;
            Path path = Paths.get(deletePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // 미디어 파일을 업로드하는 메서드
    private void uploadFile(MultipartFile media, String mediaName) throws IOException {
        String uploadPath = mediaPath + mediaName;
        Path path = Paths.get(uploadPath);
        Files.createDirectories(path.getParent());
        media.transferTo(path.toAbsolutePath());
    }

    // 미디어를 db에 저장하는 메서드
    private Media saveMedia(String mediaName, MediaType mediaType) {

        Media media = Media.builder()
                .url(mediaName)
                .type(mediaType)
                .build();

        return mediaRepository.save(media);
    }
}
