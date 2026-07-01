package com.scommit.domain.post.postmedia.repository;

import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.postmedia.entity.PostMedia;
import com.scommit.domain.post.postmedia.entity.PostMediaType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {
    Optional<PostMedia> findByPostAndType(Post post, PostMediaType type);

    List<PostMedia> findAllByPost(Post post);
}
