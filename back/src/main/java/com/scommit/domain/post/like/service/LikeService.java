package com.scommit.domain.post.like.service;

import com.scommit.domain.post.like.entity.Like;
import com.scommit.domain.post.like.repository.LikeRepository;
import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.repository.PostRepository;
import com.scommit.domain.user.user.entity.User;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository postLikeRepository;
    private final PostRepository postRepository;

    @Transactional
    public void createLike(Long postId, User actor) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        if (!postLikeRepository.existsByPostIdAndUserId(postId, actor.getId())) {
            postLikeRepository.save(new Like(post, actor));
            post.increaseLikeCount();
        }
    }

    @Transactional
    public void deleteLike(Long postId, User actor) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        Like like = postLikeRepository.findByPostIdAndUserId(postId, actor.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        postLikeRepository.delete(like);
        post.decreaseLikeCount();
    }
}
