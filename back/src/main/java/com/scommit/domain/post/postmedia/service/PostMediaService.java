package com.scommit.domain.post.postmedia.service;

import com.scommit.domain.media.media.entity.Media;
import com.scommit.domain.media.media.service.MediaService;
import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.repository.PostRepository;
import com.scommit.domain.post.postmedia.dto.PostMediaResponse;
import com.scommit.domain.post.postmedia.entity.PostMedia;
import com.scommit.domain.post.postmedia.entity.PostMediaType;
import com.scommit.domain.post.postmedia.repository.PostMediaRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostMediaService {

    private final MediaService mediaService;
    private final PostMediaRepository postMediaRepository;
    private final PostRepository postRepository;

    @Transactional
    public PostMediaResponse uploadMedia(Long postId, MultipartFile file, PostMediaType type) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        if (type == PostMediaType.THUMBNAIL) {
            PostMedia postMedia = postMediaRepository.findByPostAndType(post, PostMediaType.THUMBNAIL).orElse(null);
            if (postMedia != null) {
                Long oldMediaId = postMedia.getMedia().getId();
                Media newMedia = mediaService.uploadMedia(file, "post");
                postMedia.updateMedia(newMedia);
                mediaService.deleteMedia(oldMediaId);
                return new PostMediaResponse(postMedia);
            }
        }

        Media media = mediaService.uploadMedia(file, "post");

        return new PostMediaResponse(postMediaRepository.save(PostMedia.builder()
                .post(post)
                .media(media)
                .type(type)
                .build()));
    }

    @Transactional(readOnly = true)
    public List<PostMediaResponse> getMediaList(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        return postMediaRepository.findAllByPost(post).stream()
                .map(PostMediaResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public PostMediaResponse getThumbnail(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        PostMedia postMedia = postMediaRepository.findByPostAndType(post, PostMediaType.THUMBNAIL)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        return new PostMediaResponse(postMedia);
    }

    @Transactional
    public void deleteMedia(Long postId, Long postMediaId) {
        PostMedia postMedia = postMediaRepository.findById(postMediaId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!postMedia.getPost().getId().equals(postId)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        if (postMedia.getPost().getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        Long mediaId = postMedia.getMedia().getId();
        postMediaRepository.delete(postMedia);
        mediaService.deleteMedia(mediaId);
    }
}
