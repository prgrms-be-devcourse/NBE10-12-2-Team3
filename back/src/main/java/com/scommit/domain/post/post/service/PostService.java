package com.scommit.domain.post.post.service;

import com.scommit.domain.post.post.dto.PostListResponse;
import com.scommit.domain.post.post.dto.PostResponse;
import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.entity.PostAccessLevel;
import com.scommit.domain.post.post.entity.PublishStatus;
import com.scommit.domain.post.post.repository.PostRepository;
import com.scommit.domain.series.series.entity.Series;
import com.scommit.domain.series.series.repository.SeriesRepository;
import com.scommit.domain.subscription.subscription.entity.SubscriptionTier;
import com.scommit.domain.subscription.subscription.repository.SubscriptionRepository;
import com.scommit.domain.user.user.entity.User;
import com.scommit.domain.user.user.repository.UserRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final SeriesRepository seriesRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;

    // 게시글 생성
    @Transactional
    public PostResponse createPost(User actor, String title, String body,
                                   PublishStatus publishStatus, PostAccessLevel accessLevel, Long seriesId) {
        Series series = seriesId != null
                ? seriesRepository.findById(seriesId).orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND))
                : null;

        Post post = Post.builder()
                .user(actor)
                .title(title)
                .body(body)
                .publishStatus(publishStatus)
                .accessLevel(accessLevel)
                .series(series)
                .build();

        return new PostResponse(postRepository.save(post));
    }

    // 홈페이지 전체 조회 - 무한 스크롤
    public Slice<PostListResponse> getPosts(Long creatorId, Pageable pageable) {
        if (creatorId != null) {
            User creator = userRepository.findByIdAndDeletedAtIsNull(creatorId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
            return postRepository.findSliceByUserAndDeletedAtIsNull(creator, pageable)
                    .map(PostListResponse::new);
        }
        return postRepository.findAllByDeletedAtIsNullAndPublishStatus(PublishStatus.PUBLIC, pageable)
                .map(PostListResponse::new);
    }


    // 게시글 상세 조회
    @Transactional
    public PostResponse getPost(Long id, User actor) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        boolean isOwner = actor != null && post.getUser().getId().equals(actor.getId());

        // PRIVATE 게시글은 작성자만 접근 가능
        if (post.getPublishStatus() == PublishStatus.PRIVATE && !isOwner) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        post.increaseViewCount();

        // PAID 게시글은 작성자 또는 멤버십 구독자만 본문 열람 가능
        if (post.getAccessLevel() == PostAccessLevel.PAID && !isOwner) {
            boolean isMember = actor != null && subscriptionRepository
                    .findByUserIdAndCreatorId(actor.getId(), post.getUser().getId())
                    .map(sub -> sub.getTier() == SubscriptionTier.MEMBERSHIP)
                    .orElse(false);
            if (!isMember) {
                return new PostResponse(post, true);
            }
        }

        return new PostResponse(post);
    }

    // 게시글 수정
    @Transactional
    public PostResponse updatePost(User actor, Long id, String title, String body,
                                   PublishStatus publishStatus, PostAccessLevel accessLevel, Long seriesId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        if (!post.getUser().getId().equals(actor.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        Series series = seriesId != null
                ? seriesRepository.findById(seriesId).orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND))
                : null;

        post.update(title, body, publishStatus, accessLevel, series);

        return new PostResponse(post);
    }

    // 게시글 삭제
    @Transactional
    public void deletePost(User actor, Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        if (!post.getUser().getId().equals(actor.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        post.softDelete();
    }

    // 특정 유저의 게시글 조회 - 번호 페이지네이션 (프로필 화면)
    public Page<PostListResponse> getUserPosts(Long userId, Pageable pageable) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        return postRepository.findByUserAndDeletedAtIsNull(user, pageable)
                .map(PostListResponse::new);
    }

    // 키워드 검색
    public Page<PostListResponse> searchPosts(String keyword, Pageable pageable) {
        return postRepository.searchByKeyword(keyword, PublishStatus.PUBLIC, pageable).map(PostListResponse::new);
    }

    // 로그인 유저의 게시글 조회
    public Page<PostListResponse> getMyPosts(User actor, Pageable pageable) {
        return postRepository.findByUserAndDeletedAtIsNull(actor, pageable)
                .map(PostListResponse::new);
    }

    // 시리즈에 포스트 추가
    @Transactional
    public void addPostToSeries(Long postId, Long seriesId, User actor) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }
        if (!post.getUser().getId().equals(actor.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        Series series = seriesRepository.findByIdAndDeletedAtIsNull(seriesId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        if (!series.getUser().getId().equals(actor.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        post.updateSeries(series);
    }

    // 시리즈에서 포스트 제거
    @Transactional
    public void removePostFromSeries(Long postId, Long seriesId, User actor) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        if (post.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        Series series = post.getSeries();
        if (series == null || !series.getId().equals(seriesId)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        if (!series.getUser().getId().equals(actor.getId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        post.updateSeries(null);
    }

    // 시리즈 내 게시글 조회
    public List<PostListResponse> getPostsBySeriesId(Long seriesId) {
        return postRepository.findBySeriesIdAndDeletedAtIsNull(seriesId).stream()
                .map(PostListResponse::new)
                .toList();
    }
}
