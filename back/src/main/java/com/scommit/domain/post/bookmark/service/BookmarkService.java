package com.scommit.domain.post.bookmark.service;

import com.scommit.domain.post.bookmark.entity.Bookmark;
import com.scommit.domain.post.bookmark.repository.BookmarkRepository;
import com.scommit.domain.post.post.dto.PostListResponse;
import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.repository.PostRepository;
import com.scommit.domain.user.user.entity.User;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookmarkService {
    private final BookmarkRepository postBookmarkRepository;
    private final PostRepository postRepository;

    @Transactional
    public void createBookmark(Long postId, User actor) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        if (!postBookmarkRepository.existsByPostIdAndUserId(postId, actor.getId())) {
            postBookmarkRepository.save(new Bookmark(post, actor));
            post.increaseBookmarkCount();
        }
    }

    @Transactional(readOnly = true)
    public Page<PostListResponse> getMyBookmarks(User actor, Pageable pageable) {
        return postBookmarkRepository.findByUserIdAndPostDeletedAtIsNull(actor.getId(), pageable)
                .map(bookmark -> new PostListResponse(bookmark.getPost()));
    }

    @Transactional
    public void deleteBookmark(Long postId, User actor) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        Bookmark bookmark = postBookmarkRepository.findByPostIdAndUserId(postId, actor.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        postBookmarkRepository.delete(bookmark);
        post.decreaseBookmarkCount();
    }
}
