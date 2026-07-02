package com.scommit.domain.user.usermedia.service;

import com.scommit.domain.media.media.entity.Media;
import com.scommit.domain.media.media.service.MediaService;
import com.scommit.domain.user.user.entity.User;
import com.scommit.domain.user.user.repository.UserRepository;
import com.scommit.domain.user.usermedia.dto.UserMediaResponse;
import com.scommit.domain.user.usermedia.entity.UserMedia;
import com.scommit.domain.user.usermedia.repository.UserMediaRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserMediaService {

    private final MediaService mediaService;
    private final UserMediaRepository userMediaRepository;
    private final UserRepository userRepository;

    @Transactional
    public UserMediaResponse uploadMedia(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        UserMedia userMedia = userMediaRepository.findByUser(user).orElse(null);
        if (userMedia != null) {
            Long oldMediaId = userMedia.getMedia().getId();
            Media newMedia = mediaService.uploadMedia(file, "user");
            userMedia.updateMedia(newMedia);
            mediaService.deleteMedia(oldMediaId);
            return new UserMediaResponse(userMedia);
        }

        Media media = mediaService.uploadMedia(file, "user");

        return new UserMediaResponse(userMediaRepository.save(UserMedia.builder()
                .user(user)
                .media(media)
                .build()));
    }

    @Transactional(readOnly = true)
    public UserMediaResponse getMedia(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        UserMedia userMedia = userMediaRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        return new UserMediaResponse(userMedia);
    }

    @Transactional
    public void deleteMedia(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        UserMedia userMedia = userMediaRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        Long mediaId = userMedia.getMedia().getId();
        userMediaRepository.delete(userMedia);
        mediaService.deleteMedia(mediaId);
    }
}
