package com.scommit.domain.post.post.repository;

import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.entity.PublishStatus;
import com.scommit.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 특정 유저 게시글 전체 조회 - 관리자용 (삭제된 게시글 포함)
    List<Post> findByUser(User user);

    // 특정 유저의 삭제되지 않은 게시글 페이지 조회
    Page<Post> findByUserAndDeletedAtIsNull(User user, Pageable pageable);

    // 특정 유저의 삭제되지 않은 게시글 무한 스크롤 조회
    Slice<Post> findSliceByUserAndDeletedAtIsNull(User user, Pageable pageable);

    // 홈페이지 전체 조회 - 무한 스크롤 (PUBLIC만)
    Slice<Post> findAllByDeletedAtIsNullAndPublishStatus(PublishStatus publishStatus, Pageable pageable);

    // 시리즈의 게시글 조회
    List<Post> findBySeriesIdAndDeletedAtIsNull(Long seriesId);

    // 키워드 검색 (제목·본문, PUBLIC만)
    @Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL AND p.publishStatus = :status AND (p.title LIKE %:keyword% OR p.body LIKE %:keyword%)")
    Page<Post> searchByKeyword(@Param("keyword") String keyword, @Param("status") PublishStatus status, Pageable pageable);
}
