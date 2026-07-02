package com.scommit.domain.media.media.service;

import com.scommit.domain.media.media.entity.Media;
import org.springframework.web.multipart.MultipartFile;

public interface MediaService {
    Media uploadMedia(MultipartFile file, String category);

    void deleteMedia(Long mediaId);
}
