package com.scommit.domain.post.comment.service;

import com.scommit.domain.post.comment.dto.CommentResponse;
import com.scommit.domain.post.comment.entity.Comment;
import com.scommit.domain.post.comment.repository.CommentRepository;
import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.repository.PostRepository;
import com.scommit.domain.user.user.entity.User;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    // 댓글 작성
    @Transactional
    public CommentResponse createComment(User actor, Long postId, String body) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        Comment comment = Comment.builder()
                .user(actor)
                .post(post)
                .body(body)
                .build();

        return new CommentResponse(commentRepository.save(comment));
    }

    // 특정 게시글 댓글 페이지 조회
    public Page<CommentResponse> getComments(Long postId, Pageable pageable) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        return commentRepository.findAllByPostIdAndDeletedAtIsNull(postId, pageable)
                .map(CommentResponse::new);
    }

    // 댓글 수정
    @Transactional
    public CommentResponse updateComment(User actor, Long id, String body) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (comment.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        if (!comment.getUser().getId().equals(actor.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        comment.update(body);
        return new CommentResponse(comment);
    }

    // 댓글 삭제
    @Transactional
    public void deleteComment(User actor, Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (comment.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        if (!comment.getUser().getId().equals(actor.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        comment.softDelete();
    }
}
