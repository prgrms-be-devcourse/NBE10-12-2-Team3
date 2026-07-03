package com.scommit.domain.post.post.service;

import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.entity.PostAccessLevel;
import com.scommit.domain.post.post.entity.PublishStatus;
import com.scommit.domain.post.post.repository.PostRepository;
import com.scommit.domain.series.series.entity.Series;
import com.scommit.domain.series.series.repository.SeriesRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private SeriesRepository seriesRepository;

    @InjectMocks
    private PostService postService;

    private User mockUser;
    private User otherUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .email("test@example.com")
                .nickname("테스터")
                .role(UserRole.USER)
                .build();
        ReflectionTestUtils.setField(mockUser, "id", 1L);

        otherUser = User.builder()
                .email("other@example.com")
                .nickname("다른유저")
                .role(UserRole.USER)
                .build();
        ReflectionTestUtils.setField(otherUser, "id", 2L);
    }

    private Post buildPost(Long id, User user, Series series) {
        Post post = Post.builder()
                .user(user)
                .series(series)
                .title("테스트 포스트")
                .body("내용")
                .publishStatus(PublishStatus.PUBLIC)
                .accessLevel(PostAccessLevel.FREE)
                .build();
        ReflectionTestUtils.setField(post, "id", id);
        return post;
    }

    private Post buildDeletedPost(Long id, User user) {
        Post post = buildPost(id, user, null);
        ReflectionTestUtils.setField(post, "deletedAt", LocalDateTime.now());
        return post;
    }

    private Series buildSeries(Long id, User owner) {
        Series series = Series.builder()
                .user(owner)
                .title("시리즈")
                .body("설명")
                .build();
        ReflectionTestUtils.setField(series, "id", id);
        return series;
    }

    @Nested
    @DisplayName("시리즈에 포스트 추가 테스트")
    class AddPostToSeries {

        @Test
        @DisplayName("성공: 포스트와 시리즈 모두 본인 소유일 때 추가된다.")
        void add_Success() {
            Series series = buildSeries(5L, mockUser);
            Post post = buildPost(10L, mockUser, null);

            when(postRepository.findById(10L)).thenReturn(Optional.of(post));
            when(seriesRepository.findByIdAndDeletedAtIsNull(5L)).thenReturn(Optional.of(series));

            postService.addPostToSeries(10L, 5L, mockUser);

            assertThat(post.getSeries()).isEqualTo(series);
        }

        @Test
        @DisplayName("실패: 존재하지 않는 포스트면 POST_NOT_FOUND 예외를 던진다.")
        void add_PostNotFound() {
            when(postRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> postService.addPostToSeries(999L, 5L, mockUser))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.POST_NOT_FOUND);

            verify(seriesRepository, never()).findByIdAndDeletedAtIsNull(any());
        }

        @Test
        @DisplayName("실패: 삭제된 포스트면 POST_NOT_FOUND 예외를 던진다.")
        void add_PostDeleted() {
            Post deletedPost = buildDeletedPost(10L, mockUser);
            when(postRepository.findById(10L)).thenReturn(Optional.of(deletedPost));

            assertThatThrownBy(() -> postService.addPostToSeries(10L, 5L, mockUser))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.POST_NOT_FOUND);
        }

        @Test
        @DisplayName("실패: 포스트 주인이 아니면 ACCESS_DENIED 예외를 던진다.")
        void add_PostNotOwned() {
            Post post = buildPost(10L, otherUser, null);
            when(postRepository.findById(10L)).thenReturn(Optional.of(post));

            assertThatThrownBy(() -> postService.addPostToSeries(10L, 5L, mockUser))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ACCESS_DENIED);

            verify(seriesRepository, never()).findByIdAndDeletedAtIsNull(any());
        }

        @Test
        @DisplayName("실패: 존재하지 않는 시리즈면 RESOURCE_NOT_FOUND 예외를 던진다.")
        void add_SeriesNotFound() {
            Post post = buildPost(10L, mockUser, null);
            when(postRepository.findById(10L)).thenReturn(Optional.of(post));
            when(seriesRepository.findByIdAndDeletedAtIsNull(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> postService.addPostToSeries(10L, 999L, mockUser))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND);
        }

        @Test
        @DisplayName("실패: 시리즈 주인이 아니면 ACCESS_DENIED 예외를 던진다.")
        void add_SeriesNotOwned() {
            Series series = buildSeries(5L, otherUser);
            Post post = buildPost(10L, mockUser, null);

            when(postRepository.findById(10L)).thenReturn(Optional.of(post));
            when(seriesRepository.findByIdAndDeletedAtIsNull(5L)).thenReturn(Optional.of(series));

            assertThatThrownBy(() -> postService.addPostToSeries(10L, 5L, mockUser))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ACCESS_DENIED);
        }
    }

    @Nested
    @DisplayName("시리즈에서 포스트 제거 테스트")
    class RemovePostFromSeries {

        @Test
        @DisplayName("성공: 포스트가 해당 시리즈에 속하고 시리즈 주인이면 제거된다.")
        void remove_Success() {
            Series series = buildSeries(5L, mockUser);
            Post post = buildPost(10L, mockUser, series);

            when(postRepository.findById(10L)).thenReturn(Optional.of(post));

            postService.removePostFromSeries(10L, 5L, mockUser);

            assertThat(post.getSeries()).isNull();
        }

        @Test
        @DisplayName("실패: 존재하지 않는 포스트면 POST_NOT_FOUND 예외를 던진다.")
        void remove_PostNotFound() {
            when(postRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> postService.removePostFromSeries(999L, 5L, mockUser))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.POST_NOT_FOUND);
        }

        @Test
        @DisplayName("실패: 삭제된 포스트면 POST_NOT_FOUND 예외를 던진다.")
        void remove_PostDeleted() {
            Post deletedPost = buildDeletedPost(10L, mockUser);
            when(postRepository.findById(10L)).thenReturn(Optional.of(deletedPost));

            assertThatThrownBy(() -> postService.removePostFromSeries(10L, 5L, mockUser))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.POST_NOT_FOUND);
        }

        @Test
        @DisplayName("실패: 포스트가 어떤 시리즈에도 속하지 않으면 RESOURCE_NOT_FOUND 예외를 던진다.")
        void remove_PostHasNoSeries() {
            Post post = buildPost(10L, mockUser, null);
            when(postRepository.findById(10L)).thenReturn(Optional.of(post));

            assertThatThrownBy(() -> postService.removePostFromSeries(10L, 5L, mockUser))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND);
        }

        @Test
        @DisplayName("실패: 포스트가 다른 시리즈에 속하면 RESOURCE_NOT_FOUND 예외를 던진다.")
        void remove_PostBelongsToDifferentSeries() {
            Series otherSeries = buildSeries(99L, mockUser);
            Post post = buildPost(10L, mockUser, otherSeries);
            when(postRepository.findById(10L)).thenReturn(Optional.of(post));

            assertThatThrownBy(() -> postService.removePostFromSeries(10L, 5L, mockUser))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND);
        }

        @Test
        @DisplayName("실패: 시리즈 주인이 아니면 ACCESS_DENIED 예외를 던진다.")
        void remove_SeriesNotOwned() {
            Series series = buildSeries(5L, otherUser);
            Post post = buildPost(10L, mockUser, series);
            when(postRepository.findById(10L)).thenReturn(Optional.of(post));

            assertThatThrownBy(() -> postService.removePostFromSeries(10L, 5L, mockUser))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ACCESS_DENIED);
        }
    }
}