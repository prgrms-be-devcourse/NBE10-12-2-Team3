package com.scommit.domain.post.post.repository;

import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 특정 유저 게시글 전체 조회 (GET /posts?creatorId={id})
    List<Post> findByUser(User user);

    // 내가 쓴 게시글 전체 조회 (GET /posts/me)
    List<Post> findByUserAndDeletedAtIsNull(User user);

    // 삭제되지 않은 게시글 전체 조회
    List<Post> findAllByDeletedAtIsNull();
}