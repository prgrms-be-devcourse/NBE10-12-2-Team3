package com.scommit.domain.post.comment.service;

import com.scommit.domain.post.comment.dto.CommentResponse;
import com.scommit.domain.post.comment.entity.Comment;
import com.scommit.domain.post.comment.repository.CommentRepository;
import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.repository.PostRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    // TODO: User 도메인 완료 후 UserRepository 추가

    // 댓글 작성
    @Transactional
    public CommentResponse createComment(Long postId, String body) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        // TODO: 유저 연동 완료 후 로그인 유저로 교체
        Comment comment = Comment.builder()
                .post(post)
                .body(body)
                .build();

        return new CommentResponse(commentRepository.save(comment));
    }

    // 특정 게시글 댓글 전체 조회
    public List<CommentResponse> getComments(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        return commentRepository.findAllByPostIdAndDeletedAtIsNull(postId).stream()
                .map(CommentResponse::new)
                .toList();
    }

    // 댓글 수정
    @Transactional
    public CommentResponse updateComment(Long id, String body) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (comment.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        // TODO: 본인 댓글인지 확인 (유저 연동 완료 후)

        comment.update(body);
        return new CommentResponse(comment);
    }

    // 댓글 삭제
    @Transactional
    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (comment.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        // TODO: 본인 댓글인지 확인 (User 도메인 완료 후)

        comment.softDelete();
    }
}
