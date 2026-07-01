package com.scommit.domain.post.comment.repository;

import com.scommit.domain.post.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 특정 게시글의 삭제되지 않은 댓글 전체 조회 (GET /posts/{postId}/comments)
    List<Comment> findAllByPostIdAndDeletedAtIsNull(Long postId);
}
