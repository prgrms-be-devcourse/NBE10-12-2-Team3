package com.scommit.domain.post.post.repository;

import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 특정 유저 게시글 전체 조회 - 관리자용 (삭제된 게시글 포함)
    List<Post> findByUser(User user);

    // 특정 유저 게시글 조회 / 내가 쓴 게시글 조회 (GET /posts?creatorId={id}, GET /posts/me) - 페이지 번호 방식
    Page<Post> findByUserAndDeletedAtIsNull(User user, Pageable pageable);

    // 홈페이지 전체 조회 - 무한 스크롤
    Slice<Post> findAllByDeletedAtIsNull(Pageable pageable);
}
