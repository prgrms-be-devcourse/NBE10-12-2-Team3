package com.scommit.domain.post.like.service;

import com.scommit.domain.post.like.entity.Like;
import com.scommit.domain.post.like.repository.LikeRepository;
import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.entity.PostAccessLevel;
import com.scommit.domain.post.post.entity.PublishStatus;
import com.scommit.domain.post.post.repository.PostRepository;
import com.scommit.domain.user.user.entity.User;
import com.scommit.domain.user.user.entity.UserRole;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class LikeServiceTest {

    @Mock
    private LikeRepository likeRepository;

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private LikeService likeService;

    private User actor;
    private Post post;

    @BeforeEach
    void setUp() {
        actor = User.builder()
                .email("actor@test.com")
                .nickname("액터")
                .role(UserRole.USER)
                .build();
        ReflectionTestUtils.setField(actor, "id", 1L);

        post = Post.builder()
                .title("테스트 게시글")
                .body("내용")
                .publishStatus(PublishStatus.PUBLIC)
                .accessLevel(PostAccessLevel.FREE)
                .build();
        ReflectionTestUtils.setField(post, "id", 10L);
    }

    @Nested
    @DisplayName("좋아요 추가 테스트")
    class CreateLikeTest {

        @Test
        @DisplayName("성공: 좋아요가 추가되고 likeCount가 증가한다")
        void createLike_success() {
            // given
            given(postRepository.findById(10L)).willReturn(Optional.of(post));
            given(likeRepository.existsByPostIdAndUserId(10L, 1L)).willReturn(false);

            // when
            likeService.createLike(10L, actor);

            // then
            verify(likeRepository).save(any(Like.class));
            assertThat(post.getLikeCount()).isEqualTo(1L);
        }

        @Test
        @DisplayName("성공: 이미 좋아요한 경우 조용히 무시된다")
        void createLike_alreadyLiked_ignored() {
            // given
            given(postRepository.findById(10L)).willReturn(Optional.of(post));
            given(likeRepository.existsByPostIdAndUserId(10L, 1L)).willReturn(true);

            // when
            likeService.createLike(10L, actor);

            // then
            verify(likeRepository, never()).save(any());
            assertThat(post.getLikeCount()).isEqualTo(0L);
        }

        @Test
        @DisplayName("실패: 존재하지 않는 게시글이면 POST_NOT_FOUND 예외를 던진다")
        void createLike_postNotFound() {
            // given
            given(postRepository.findById(999L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> likeService.createLike(999L, actor))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.POST_NOT_FOUND);

            verify(likeRepository, never()).save(any());
        }

        @Test
        @DisplayName("실패: 삭제된 게시글이면 POST_NOT_FOUND 예외를 던진다")
        void createLike_deletedPost() {
            // given
            ReflectionTestUtils.setField(post, "deletedAt", LocalDateTime.now());
            given(postRepository.findById(10L)).willReturn(Optional.of(post));

            // when & then
            assertThatThrownBy(() -> likeService.createLike(10L, actor))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.POST_NOT_FOUND);

            verify(likeRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("좋아요 취소 테스트")
    class DeleteLikeTest {

        @Test
        @DisplayName("성공: 좋아요가 취소되고 likeCount가 감소한다")
        void deleteLike_success() {
            // given
            ReflectionTestUtils.setField(post, "likeCount", 1L);
            Like like = new Like(post, actor);
            given(postRepository.findById(10L)).willReturn(Optional.of(post));
            given(likeRepository.findByPostIdAndUserId(10L, 1L)).willReturn(Optional.of(like));

            // when
            likeService.deleteLike(10L, actor);

            // then
            verify(likeRepository).delete(like);
            assertThat(post.getLikeCount()).isEqualTo(0L);
        }

        @Test
        @DisplayName("실패: 좋아요가 없는 경우 RESOURCE_NOT_FOUND 예외를 던진다")
        void deleteLike_likeNotFound() {
            // given
            given(postRepository.findById(10L)).willReturn(Optional.of(post));
            given(likeRepository.findByPostIdAndUserId(10L, 1L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> likeService.deleteLike(10L, actor))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND);

            verify(likeRepository, never()).delete(any());
        }

        @Test
        @DisplayName("실패: 존재하지 않는 게시글이면 POST_NOT_FOUND 예외를 던진다")
        void deleteLike_postNotFound() {
            // given
            given(postRepository.findById(999L)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> likeService.deleteLike(999L, actor))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.POST_NOT_FOUND);

            verify(likeRepository, never()).delete(any());
        }

        @Test
        @DisplayName("실패: 삭제된 게시글이면 POST_NOT_FOUND 예외를 던진다")
        void deleteLike_deletedPost() {
            // given
            ReflectionTestUtils.setField(post, "deletedAt", LocalDateTime.now());
            given(postRepository.findById(10L)).willReturn(Optional.of(post));

            // when & then
            assertThatThrownBy(() -> likeService.deleteLike(10L, actor))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.POST_NOT_FOUND);

            verify(likeRepository, never()).delete(any());
        }
    }
}
