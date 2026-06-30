package com.scommit.domain.series.series.service;

import com.scommit.domain.series.series.entity.Series;
import com.scommit.domain.series.series.repository.SeriesRepository;
import com.scommit.domain.user.entity.User;
import com.scommit.domain.user.entity.UserRole;
import com.scommit.domain.user.repository.UserRepository;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SeriesServiceTest {

    @Mock
    private SeriesRepository seriesRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SeriesService seriesService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .email("test@example.com")
                .nickname("테스터")
                .role(UserRole.USER)
                .build();
        ReflectionTestUtils.setField(mockUser, "id", 1L);
    }

    private Series buildSeries(Long id, String title, String body) {
        Series series = Series.builder()
                .user(mockUser)
                .title(title)
                .body(body)
                .build();
        ReflectionTestUtils.setField(series, "id", id);
        return series;
    }

    @Nested
    @DisplayName("시리즈 생성 테스트")
    class CreateSeries {

        @Test
        @DisplayName("성공: 올바른 요청인 경우 시리즈를 정상 저장한다.")
        void create_Success() {
            // Given
            Series series = buildSeries(100L, "시리즈 제목", "시리즈 설명");

            when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
            when(seriesRepository.save(any(Series.class))).thenReturn(series);

            // When
            Series result = seriesService.createSeries("시리즈 제목", "시리즈 설명", 1L);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(100L);
            assertThat(result.getTitle()).isEqualTo("시리즈 제목");
            assertThat(result.getUser().getId()).isEqualTo(1L);
            verify(seriesRepository, times(1)).save(any(Series.class));
        }

        @Test
        @DisplayName("실패: 유저가 존재하지 않으면 USER_NOT_FOUND 예외를 던진다.")
        void create_UserNotFound() {
            // Given
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> seriesService.createSeries("시리즈 제목", "시리즈 설명", 999L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);

            verify(seriesRepository, never()).save(any(Series.class));
        }
    }

    @Nested
    @DisplayName("시리즈 전체 조회 테스트")
    class FindAllSeries {

        @Test
        @DisplayName("성공: creatorId가 null이면 삭제되지 않은 전체 시리즈를 조회한다.")
        void findAll_WithoutCreatorId() {
            // Given
            List<Series> list = List.of(buildSeries(1L, "제목1", "내용1"));
            Page<Series> page = new PageImpl<>(list);
            when(seriesRepository.findAllByDeletedAtIsNull(any(Pageable.class))).thenReturn(page);

            // When
            Page<Series> result = seriesService.getSeriesList(null, 0);

            // Then
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().getFirst().getTitle()).isEqualTo("제목1");
            verify(seriesRepository, times(1)).findAllByDeletedAtIsNull(any(Pageable.class));
            verify(seriesRepository, never()).findByUserIdAndDeletedAtIsNull(anyLong(), any(Pageable.class));
        }

        @Test
        @DisplayName("성공: creatorId가 제공되면 해당 유저가 작성한 삭제되지 않은 시리즈를 조회한다.")
        void findAll_WithCreatorId() {
            // Given
            List<Series> list = List.of(buildSeries(1L, "제목1", "내용1"));
            Page<Series> page = new PageImpl<>(list);
            when(seriesRepository.findByUserIdAndDeletedAtIsNull(eq(1L), any(Pageable.class))).thenReturn(page);

            // When
            Page<Series> result = seriesService.getSeriesList(1L, 0);

            // Then
            assertThat(result.getContent()).hasSize(1);
            verify(seriesRepository, times(1)).findByUserIdAndDeletedAtIsNull(eq(1L), any(Pageable.class));
            verify(seriesRepository, never()).findAllByDeletedAtIsNull(any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("시리즈 상세 조회 테스트")
    class FindSeriesById {

        @Test
        @DisplayName("성공: 삭제되지 않은 시리즈인 경우 데이터를 올바르게 반환한다.")
        void findById_Success() {
            // Given
            Series series = buildSeries(1L, "제목1", "내용1");
            when(seriesRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(series));

            // When
            Series result = seriesService.getSeries(1L);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getTitle()).isEqualTo("제목1");
        }

        @Test
        @DisplayName("실패: 존재하지 않는 시리즈 ID인 경우 RESOURCE_NOT_FOUND 예외를 던진다.")
        void findById_NotFound() {
            // Given
            when(seriesRepository.findByIdAndDeletedAtIsNull(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> seriesService.getSeries(999L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND);
        }

        @Test
        @DisplayName("실패: 삭제된 시리즈인 경우 RESOURCE_NOT_FOUND 예외를 던진다.")
        void findById_SoftDeleted() {
            // Given — 삭제된 시리즈는 findByIdAndDeletedAtIsNull이 빈 Optional을 반환
            when(seriesRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> seriesService.getSeries(1L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("시리즈 수정 테스트")
    class UpdateSeries {

        @Test
        @DisplayName("성공: 활성 상태의 시리즈인 경우 제목과 본문을 업데이트한다.")
        void update_Success() {
            // Given
            Series series = buildSeries(1L, "기존 제목", "기존 설명");
            when(seriesRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(series));

            // When
            Series result = seriesService.updateSeries(1L, "수정된 제목", "수정된 설명");

            // Then
            assertThat(result.getTitle()).isEqualTo("수정된 제목");
            assertThat(result.getBody()).isEqualTo("수정된 설명");
        }

        @Test
        @DisplayName("실패: 이미 삭제된 시리즈를 수정하려고 시도하면 RESOURCE_NOT_FOUND 예외를 던진다.")
        void update_SoftDeleted() {
            // Given
            when(seriesRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> seriesService.updateSeries(1L, "수정된 제목", "수정된 설명"))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("시리즈 삭제 테스트")
    class DeleteSeries {

        @Test
        @DisplayName("성공: 활성 상태의 시리즈인 경우 deletedAt 필드를 세팅해 삭제 처리한다.")
        void delete_Success() {
            // Given
            Series series = buildSeries(1L, "시리즈 제목", "시리즈 설명");
            when(seriesRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(series));

            // When
            seriesService.deleteSeries(1L);

            // Then
            assertThat(series.getDeletedAt()).isNotNull();
        }

        @Test
        @DisplayName("실패: 이미 삭제된 시리즈를 삭제하려고 시도하면 RESOURCE_NOT_FOUND 예외를 던진다.")
        void delete_AlreadyDeleted() {
            // Given
            when(seriesRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> seriesService.deleteSeries(1L))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND);
        }
    }
}
