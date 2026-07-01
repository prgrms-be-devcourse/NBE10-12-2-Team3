package com.scommit.domain.media.service;

import com.scommit.domain.media.entity.Media;
import com.scommit.domain.media.entity.MediaType;
import com.scommit.domain.media.repository.MediaRepository;
import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.repository.PostRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

// TODO: 배포 전환시에 따른 인터페이스 추상화 추가 필요
@Service
@RequiredArgsConstructor
public class MediaService {
    private final MediaRepository mediaRepository;
    private final PostRepository postRepository;
    
    @Value("${file.path}")
    private String mediaPath;

    // 미디어를 생성하는 메서
    @Transactional
    public Media create(Long postId, MultipartFile file) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if(file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        String mediaUrl = addUUID(file.getOriginalFilename());

        try {
            uploadMedia(file, mediaUrl);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        MediaType mediaType = getMediaType(file.getContentType());
        return saveMedia(post, mediaUrl, mediaType);
    }

    // 미디어를 삭제하는 메서드
    @Transactional
    public void delete(long id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        mediaRepository.delete(media);

        deleteFile(media.getUrl());
    }

    // 미디어를 프로젝트 내에서 삭제하는 메서드
    private void deleteFile(String mediaName) {
        try {
            String deletePath = mediaPath + mediaName;
            Path path = Paths.get(deletePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
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

    // TODO: 원본 이름 제거 로직 추가(특수문자 포함으로 인식불가 오류 방지)
    // 이름 중복 방지용 미디어 이름 앞에 UUID 추가하는 메서드
    private static String addUUID(String originalFilename) {
        return UUID.randomUUID().toString().replace("-", "") + "_" + originalFilename;
    }

    // TODO: 압축 로직 추가 고민중
    // 미디어를 프로젝트 내에 업로드하는 메서드
    private void uploadMedia(MultipartFile media, String mediaName) throws IOException {
        String uploadPath = mediaPath + mediaName;
        Path path = Paths.get(uploadPath);
        Files.createDirectories(path.getParent());
        media.transferTo(path.toAbsolutePath());
    }

    // 미디어를 생성후 db에 저장하는 메서드
    private Media saveMedia(Post post, String mediaName, MediaType mediaType) {

        Media media = Media.builder()
                .post(post)
                .url(mediaName)
                .type(mediaType)
                .build();

        return mediaRepository.save(media);
    }
}
