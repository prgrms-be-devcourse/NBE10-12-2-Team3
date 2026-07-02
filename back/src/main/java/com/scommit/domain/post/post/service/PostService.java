package com.scommit.domain.post.post.service;

import com.scommit.domain.post.post.dto.PostListResponse;
import com.scommit.domain.post.post.dto.PostResponse;
import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.entity.PostAccessLevel;
import com.scommit.domain.post.post.entity.PublishStatus;
import com.scommit.domain.post.post.repository.PostRepository;
import com.scommit.domain.series.series.entity.Series;
import com.scommit.domain.series.series.repository.SeriesRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final SeriesRepository seriesRepository;
    // TODO: Security 완료 후 UserRepository 추가

    // 게시글 생성
    @Transactional
    public PostResponse createPost(String title, String body, String thumbnail,
                                   PublishStatus publishStatus, PostAccessLevel accessLevel, Long seriesId) {
        // TODO: Security 완료 후 로그인 유저로 교체
        Series series = seriesId != null
                ? seriesRepository.findById(seriesId).orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND))
                : null;

        Post post = Post.builder()
                .title(title)
                .body(body)
                .thumbnail(thumbnail)
                .publishStatus(publishStatus)
                .accessLevel(accessLevel)
                .series(series)
                .build();

        return new PostResponse(postRepository.save(post));
    }

    // 게시글 전체 조회 / 특정 유저 게시글 조회
    public List<PostListResponse> getPosts(Long creatorId) {
        // TODO: creatorId로 특정 유저 게시글 조회 (UserRepository 완료 후)
        return postRepository.findAllByDeletedAtIsNull().stream()
                .map(PostListResponse::new)
                .toList();
    }

    // 게시글 상세 조회
    public PostResponse getPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        post.increaseViewCount();

        return new PostResponse(post);
    }

    // 게시글 수정
    @Transactional
    public PostResponse updatePost(Long id, String title, String body, String thumbnail,
                                   PublishStatus publishStatus, PostAccessLevel accessLevel, Long seriesId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        // TODO: 본인 게시글인지 확인 (Security 완료 후)
        Series series = seriesId != null
                ? seriesRepository.findById(seriesId).orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND))
                : null;

        post.update(title, body, thumbnail, publishStatus, accessLevel, series);

        return new PostResponse(post);
    }

    // 게시글 삭제
    @Transactional
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        // TODO: 본인 게시글인지 확인 (Security 완료 후)

        post.softDelete();
    }

    // 내가 쓴 게시글 조회
    public List<PostListResponse> getMyPosts() {
        // TODO: Security 완료 후 로그인 유저로 교체
        return postRepository.findAllByDeletedAtIsNull().stream()
                .map(PostListResponse::new)
                .toList();
    }
}
