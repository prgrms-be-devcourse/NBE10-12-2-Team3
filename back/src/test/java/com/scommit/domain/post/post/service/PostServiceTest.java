package com.scommit.domain.post.post.service;

import com.scommit.domain.post.post.dto.PostResponse;
import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.entity.PostAccessLevel;
import com.scommit.domain.post.post.entity.PublishStatus;
import com.scommit.domain.post.post.repository.PostRepository;
import com.scommit.domain.series.series.entity.Series;
import com.scommit.domain.series.series.repository.SeriesRepository;
import com.scommit.domain.user.user.entity.User;
import com.scommit.domain.user.user.entity.UserRole;
import com.scommit.domain.user.user.repository.UserRepository;
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

/**
 * PostService 단위 테스트
 * - DB, Spring Context 없이 Mockito로 의존성을 가짜(Mock)로 대체
 * - postRepository, seriesRepository, userRepository의 반환값을 미리 지정(when/thenReturn)하고
 *   실제 서비스 로직만 검증
 */
@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private SeriesRepository seriesRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PostService postService;

    // 테스트에 사용할 유저 2명 (본인 / 타인 구분용)
    private User mockUser;
    private User otherUser;

    @BeforeEach
    void setUp() {
        // JPA가 없으므로 id는 ReflectionTestUtils로 직접 주입
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

    // 테스트용 Post 빌더 헬퍼 - 매 테스트마다 반복 코드를 줄이기 위해 사용
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

    // softDelete된 게시글 생성 (deletedAt이 null이 아닌 상태)
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
    @DisplayName("게시글 생성 테스트")
    class CreatePost {

        // seriesId가 null이면 시리즈 조회를 아예 하지 않아야 함
        @Test
        @DisplayName("성공: 시리즈 없이 게시글을 생성한다.")
        void create_Success_NoSeries() {
            Post saved = buildPost(1L, mockUser, null);
            when(postRepository.save(any(Post.class))).thenReturn(saved);

            PostResponse response = postService.createPost(mockUser, "제목", "내용",
                    PublishStatus.PUBLIC, PostAccessLevel.FREE, null);

            assertThat(response.userId()).isEqualTo(mockUser.getId());
            // seriesId가 null이면 seriesRepository를 호출하지 않는지 검증
            verify(seriesRepository, never()).findById(any());
        }

        // seriesId가 있으면 시리즈를 조회해서 게시글에 연결해야 함
        @Test
        @DisplayName("성공: 존재하는 시리즈와 함께 게시글을 생성한다.")
        void create_Success_WithSeries() {
            Series series = buildSeries(5L, mockUser);
            Post saved = buildPost(1L, mockUser, series);
            when(seriesRepository.findById(5L)).thenReturn(Optional.of(series));
            when(postRepository.save(any(Post.class))).thenReturn(saved);

            PostResponse response = postService.createPost(mockUser, "제목", "내용",
                    PublishStatus.PUBLIC, PostAccessLevel.FREE, 5L);

            assertThat(response.seriesId()).isEqualTo(5L);
        }

        // 없는 시리즈 ID를 넘기면 저장 전에 예외가 발생해야 함
        @Test
        @DisplayName("실패: 존재하지 않는 시리즈 ID면 RESOURCE_NOT_FOUND 예외를 던진다.")
        void create_SeriesNotFound() {
            when(seriesRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> postService.createPost(mockUser, "제목", "내용",
                    PublishStatus.PUBLIC, PostAccessLevel.FREE, 999L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("게시글 수정 테스트")
    class UpdatePost {

        // 본인 게시글 수정 → 제목/내용이 실제로 바뀌는지 확인
        @Test
        @DisplayName("성공: 본인 게시글을 수정한다.")
        void update_Success() {
            Post post = buildPost(1L, mockUser, null);
            when(postRepository.findById(1L)).thenReturn(Optional.of(post));

            PostResponse response = postService.updatePost(mockUser, 1L, "수정제목", "수정내용",
                    PublishStatus.DRAFT, PostAccessLevel.FREE, null);

            assertThat(response.title()).isEqualTo("수정제목");
        }

        // 없는 게시글 ID → 조회 시점에 예외 발생
        @Test
        @DisplayName("실패: 존재하지 않는 게시글이면 POST_NOT_FOUND 예외를 던진다.")
        void update_PostNotFound() {
            when(postRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> postService.updatePost(mockUser, 999L, "제목", "내용",
                    PublishStatus.PUBLIC, PostAccessLevel.FREE, null))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.POST_NOT_FOUND);
        }

        // softDelete된 게시글은 없는 것과 동일하게 처리
        @Test
        @DisplayName("실패: 삭제된 게시글이면 POST_NOT_FOUND 예외를 던진다.")
        void update_PostDeleted() {
            Post deletedPost = buildDeletedPost(1L, mockUser);
            when(postRepository.findById(1L)).thenReturn(Optional.of(deletedPost));

            assertThatThrownBy(() -> postService.updatePost(mockUser, 1L, "제목", "내용",
                    PublishStatus.PUBLIC, PostAccessLevel.FREE, null))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.POST_NOT_FOUND);
        }

        // 타인의 게시글 수정 시도 → 본인 확인 로직에서 차단
        @Test
        @DisplayName("실패: 다른 유저의 게시글을 수정하면 ACCESS_DENIED 예외를 던진다.")
        void update_NotOwner() {
            Post post = buildPost(1L, otherUser, null);
            when(postRepository.findById(1L)).thenReturn(Optional.of(post));

            assertThatThrownBy(() -> postService.updatePost(mockUser, 1L, "제목", "내용",
                    PublishStatus.PUBLIC, PostAccessLevel.FREE, null))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ACCESS_DENIED);
        }
    }

    @Nested
    @DisplayName("게시글 삭제 테스트")
    class DeletePost {

        // softDelete 방식이므로 실제로 행이 지워지는 게 아니라 deletedAt이 채워져야 함
        @Test
        @DisplayName("성공: 본인 게시글을 삭제한다.")
        void delete_Success() {
            Post post = buildPost(1L, mockUser, null);
            when(postRepository.findById(1L)).thenReturn(Optional.of(post));

            postService.deletePost(mockUser, 1L);

            assertThat(post.getDeletedAt()).isNotNull();
        }

        // 없는 게시글 삭제 시도
        @Test
        @DisplayName("실패: 존재하지 않는 게시글이면 POST_NOT_FOUND 예외를 던진다.")
        void delete_PostNotFound() {
            when(postRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> postService.deletePost(mockUser, 999L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.POST_NOT_FOUND);
        }

        // 이미 삭제된 게시글 재삭제 시도 → 멱등성 보장이 아닌 에러 반환 방식
        @Test
        @DisplayName("실패: 이미 삭제된 게시글이면 POST_NOT_FOUND 예외를 던진다.")
        void delete_AlreadyDeleted() {
            Post deletedPost = buildDeletedPost(1L, mockUser);
            when(postRepository.findById(1L)).thenReturn(Optional.of(deletedPost));

            assertThatThrownBy(() -> postService.deletePost(mockUser, 1L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.POST_NOT_FOUND);
        }

        // 타인 게시글 삭제 시도 → 본인 확인 로직에서 차단
        @Test
        @DisplayName("실패: 다른 유저의 게시글을 삭제하면 ACCESS_DENIED 예외를 던진다.")
        void delete_NotOwner() {
            Post post = buildPost(1L, otherUser, null);
            when(postRepository.findById(1L)).thenReturn(Optional.of(post));

            assertThatThrownBy(() -> postService.deletePost(mockUser, 1L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ACCESS_DENIED);
        }
    }

    @Nested
    @DisplayName("게시글 상세 조회 테스트")
    class GetPost {

        // 조회할 때마다 viewCount가 1씩 올라야 함 (더티체킹 방식)
        @Test
        @DisplayName("성공: 게시글 조회 시 조회수가 1 증가한다.")
        void getPost_Success_ViewCountIncreased() {
            Post post = buildPost(1L, mockUser, null);
            when(postRepository.findById(1L)).thenReturn(Optional.of(post));

            postService.getPost(1L);

            assertThat(post.getViewCount()).isEqualTo(1L);
        }

        // 없는 게시글 조회
        @Test
        @DisplayName("실패: 존재하지 않는 게시글이면 POST_NOT_FOUND 예외를 던진다.")
        void getPost_NotFound() {
            when(postRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> postService.getPost(999L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.POST_NOT_FOUND);
        }

        // softDelete된 게시글은 조회 불가
        @Test
        @DisplayName("실패: 삭제된 게시글이면 POST_NOT_FOUND 예외를 던진다.")
        void getPost_Deleted() {
            Post deletedPost = buildDeletedPost(1L, mockUser);
            when(postRepository.findById(1L)).thenReturn(Optional.of(deletedPost));

            assertThatThrownBy(() -> postService.getPost(1L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.POST_NOT_FOUND);
        }
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

        // 포스트 조회 실패 시 시리즈 조회는 아예 하지 않아야 함 (불필요한 DB 호출 방지)
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

        // 포스트 주인이 아니면 시리즈 조회 전에 차단해야 함
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

        // 시리즈에 속하지 않은 포스트를 특정 시리즈에서 제거하려는 경우
        @Test
        @DisplayName("실패: 포스트가 어떤 시리즈에도 속하지 않으면 RESOURCE_NOT_FOUND 예외를 던진다.")
        void remove_PostHasNoSeries() {
            Post post = buildPost(10L, mockUser, null);
            when(postRepository.findById(10L)).thenReturn(Optional.of(post));

            assertThatThrownBy(() -> postService.removePostFromSeries(10L, 5L, mockUser))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND);
        }

        // 다른 시리즈에 속한 포스트를 잘못된 시리즈 ID로 제거 시도
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
