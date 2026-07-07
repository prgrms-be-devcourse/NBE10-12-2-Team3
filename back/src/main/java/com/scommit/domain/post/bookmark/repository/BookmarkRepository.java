package com.scommit.domain.post.bookmark.repository;

import com.scommit.domain.post.bookmark.entity.Bookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    Page<Bookmark> findByUserIdAndPostDeletedAtIsNull(Long userId, Pageable pageable);

    Optional<Bookmark> findByPostIdAndUserId(Long postId, Long userId);
}
