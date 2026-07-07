package com.scommit.domain.media.media.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.scommit.domain.media.media.entity.Media;
import com.scommit.domain.media.media.entity.MediaType;
import com.scommit.domain.media.media.repository.MediaRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

// prod 프로파일에서만 활성화. dev/test는 LocalMediaService가 대신 사용됨
@Service
@Profile("prod")
@RequiredArgsConstructor
public class CloudinaryMediaService implements MediaService {

    private final Cloudinary cloudinary;
    private final MediaRepository mediaRepository;

    /**
     * 파일을 Cloudinary에 업로드하고 DB에 URL을 저장한다.
     * 업로드 방식: 서버 사이드 (브라우저 → 백엔드 → Cloudinary)
     * API Key/Secret이 서버에서만 사용되므로 클라이언트 사이드 업로드보다 보안상 안전하다.
     *
     * @param category Cloudinary 내 폴더명 (예: "series", "users")
     * @return DB에 저장된 Media 엔티티. url 필드에 Cloudinary의 절대 URL이 담겨있음
     */
    @Transactional
    @Override
    public Media uploadMedia(MultipartFile file, String category) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.EMPTY_FILE);
        }

        MediaType mediaType = resolveMediaType(file.getContentType());

        try {
            // resource_type "auto": Cloudinary가 이미지/동영상/파일을 자동 감지
            // Cloudinary SDK의 upload()는 타입 안전성 없는 Map을 반환하므로 unchecked 경고 억제
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", category, "resource_type", "auto")
            );
            // "url"(http)이 아닌 "secure_url"(https)을 저장 — 브라우저 혼합 콘텐츠 차단 방지
            String secureUrl = (String) result.get("secure_url");
            return mediaRepository.save(Media.builder().url(secureUrl).type(mediaType).build());
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DB에서 Media 레코드를 삭제하고, Cloudinary에서도 원본 파일을 제거한다.
     * destroy() 호출 시 resource_type을 명시해야 함 — 생략하면 기본값 "image"로 처리되어
     * 동영상 파일 삭제 시 404 오류 발생.
     */
    @Transactional
    @Override
    public void deleteMedia(Long mediaId) {
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEDIA_NOT_FOUND));
        mediaRepository.delete(media);
        try {
            // Cloudinary URL 경로에서 resource_type 판별
            // 이미지: .../image/upload/... | 동영상: .../video/upload/...
            String resourceType = media.getUrl().contains("/video/upload/") ? "video" : "image";
            cloudinary.uploader().destroy(extractPublicId(media.getUrl()), ObjectUtils.asMap("resource_type", resourceType));
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // MIME 타입(multipart Content-Type)으로 MediaType 열거형 변환
    private MediaType resolveMediaType(String contentType) {
        if (contentType == null) throw new BusinessException(ErrorCode.UNSUPPORTED_FILE_TYPE);
        if (contentType.startsWith("image/")) return MediaType.IMAGE;
        if (contentType.startsWith("video/")) return MediaType.VIDEO;
        throw new BusinessException(ErrorCode.UNSUPPORTED_FILE_TYPE);
    }

    /**
     * Cloudinary secure_url에서 public_id를 추출한다.
     * destroy() API는 URL이 아닌 public_id를 파라미터로 받기 때문에 변환이 필요하다.
     * <p>
     * URL 형식: {@code https://res.cloudinary.com/{cloud}/{type}/upload/v{version}/{folder}/{name}.{ext}}
     * <br>예시: {@code .../upload/v1234567/series/abc.jpg} → public_id: {@code series/abc}
     */
    private String extractPublicId(String secureUrl) {
        String[] parts = secureUrl.split("/upload/");
        String afterUpload = parts[1].replaceFirst("v\\d+/", ""); // 버전 번호(v1234567/) 제거
        int lastDot = afterUpload.lastIndexOf('.');
        return lastDot > 0 ? afterUpload.substring(0, lastDot) : afterUpload; // 확장자 제거
    }
}
