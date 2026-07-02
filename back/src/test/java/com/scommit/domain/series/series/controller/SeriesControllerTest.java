package com.scommit.domain.series.series.controller;

import com.scommit.domain.media.media.entity.MediaType;
import com.scommit.domain.series.series.dto.SeriesCreateRequest;
import com.scommit.domain.series.series.dto.SeriesUpdateRequest;
import com.scommit.domain.series.series.entity.Series;
import com.scommit.domain.series.series.service.SeriesService;
import com.scommit.domain.series.seriesmedia.dto.SeriesMediaResponse;
import com.scommit.domain.series.seriesmedia.service.SeriesMediaService;
import com.scommit.domain.user.user.entity.User;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import com.scommit.global.security.jwt.JwtFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = SeriesController.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtFilter.class)
)
class SeriesControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SeriesService seriesService;

    @MockitoBean
    private SeriesMediaService seriesMediaService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    private Series createMockSeries(Long id, Long userId, String title, String body) {
        Series series = mock(Series.class);
        User user = mock(User.class);
        when(user.getId()).thenReturn(userId);
        when(series.getId()).thenReturn(id);
        when(series.getUser()).thenReturn(user);
        when(series.getTitle()).thenReturn(title);
        when(series.getBody()).thenReturn(body);
        return series;
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/series - 새 시리즈 생성 성공")
    void createSeries_Success() throws Exception {
        SeriesCreateRequest request = new SeriesCreateRequest(1L, "시리즈 제목", "시리즈 설명");
        Series mockSeries = createMockSeries(1L, 1L, "시리즈 제목", "시리즈 설명");

        when(seriesService.createSeries(anyString(), anyString(), anyLong())).thenReturn(mockSeries);

        mockMvc.perform(post("/api/series")
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(1L))
                .andExpect(jsonPath("$.data.title").value("시리즈 제목"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/series - 시리즈 전체 조회 성공")
    void getAllSeries_Success() throws Exception {
        List<Series> mockSeriesList = List.of(
                createMockSeries(1L, 1L, "제목 1", "설명 1"),
                createMockSeries(2L, 2L, "제목 2", "설명 2")
        );

        org.springframework.data.domain.Page<Series> mockPage = new org.springframework.data.domain.PageImpl<>(mockSeriesList);

        when(seriesService.getSeriesList(eq(null), anyInt())).thenReturn(mockPage);

        mockMvc.perform(get("/api/series"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").value(2))
                .andExpect(jsonPath("$.data.content[0].title").value("제목 1"))
                .andExpect(jsonPath("$.data.pageNumber").value(0))
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.isLast").value(true));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/series/{id} - 시리즈 상세 조회 성공")
    void getSeriesDetail_Success() throws Exception {
        Series mockSeries = createMockSeries(1L, 1L, "제목 1", "설명 1");

        when(seriesService.getSeries(1L)).thenReturn(mockSeries);

        mockMvc.perform(get("/api/series/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("제목 1"));
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /api/series/{id} - 시리즈 수정 성공")
    void updateSeries_Success() throws Exception {
        SeriesUpdateRequest request = new SeriesUpdateRequest("수정된 제목", "수정된 설명");
        Series mockSeries = createMockSeries(1L, 1L, "수정된 제목", "수정된 설명");

        when(seriesService.updateSeries(eq(1L), anyString(), anyString())).thenReturn(mockSeries);

        mockMvc.perform(put("/api/series/{id}", 1L)
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("수정된 제목"));
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/series/{id} - 시리즈 삭제 성공")
    void deleteSeries_Success() throws Exception {
        mockMvc.perform(delete("/api/series/{id}", 1L)
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/series?creatorId={id} - 특정 유저의 시리즈 전체 조회 성공")
    void getSeriesByCreator_Success() throws Exception {
        List<Series> mockSeriesList = List.of(
                createMockSeries(1L, 1L, "크리에이터 제목", "크리에이터 설명")
        );

        org.springframework.data.domain.Page<Series> mockPage = new org.springframework.data.domain.PageImpl<>(mockSeriesList);

        when(seriesService.getSeriesList(eq(1L), anyInt())).thenReturn(mockPage);

        mockMvc.perform(get("/api/series").param("creatorId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").value(1))
                .andExpect(jsonPath("$.data.content[0].title").value("크리에이터 제목"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/series - 입력값 유효성 검증 실패 (400 Bad Request)")
    void createSeries_ValidationError() throws Exception {
        SeriesCreateRequest request = new SeriesCreateRequest(null, "", "설명");

        mockMvc.perform(post("/api/series")
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/series - 존재하지 않는 사용자 ID로 시리즈 생성 실패 (404 Not Found)")
    void createSeries_UserNotFound() throws Exception {
        SeriesCreateRequest request = new SeriesCreateRequest(999L, "제목", "설명");
        when(seriesService.createSeries(anyString(), anyString(), anyLong()))
                .thenThrow(new BusinessException(ErrorCode.USER_NOT_FOUND));

        mockMvc.perform(post("/api/series")
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.resultCode").value("404-2"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/series/{id} - 존재하지 않는 시리즈 상세 조회 실패 (404 Not Found)")
    void getSeriesDetail_NotFound() throws Exception {
        when(seriesService.getSeries(999L))
                .thenThrow(new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        mockMvc.perform(get("/api/series/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.resultCode").value("404-1"));
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /api/series/{id} - 입력값 유효성 검증 실패 (400 Bad Request)")
    void updateSeries_ValidationError() throws Exception {
        SeriesUpdateRequest request = new SeriesUpdateRequest("", "설명");

        mockMvc.perform(put("/api/series/{id}", 1L)
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /api/series/{id} - 존재하지 않는 시리즈 수정 실패 (404 Not Found)")
    void updateSeries_NotFound() throws Exception {
        SeriesUpdateRequest request = new SeriesUpdateRequest("수정 제목", "수정 설명");
        when(seriesService.updateSeries(eq(999L), anyString(), anyString()))
                .thenThrow(new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        mockMvc.perform(put("/api/series/{id}", 999L)
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.resultCode").value("404-1"));
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/series/{id} - 존재하지 않는 시리즈 삭제 실패 (404 Not Found)")
    void deleteSeries_NotFound() throws Exception {
        doThrow(new BusinessException(ErrorCode.RESOURCE_NOT_FOUND))
                .when(seriesService).deleteSeries(999L);

        mockMvc.perform(delete("/api/series/{id}", 999L)
                        .with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.resultCode").value("404-1"));
    }

    @Nested
    @DisplayName("GET /api/series/{id}/medias 시리즈 썸네일 조회")
    class GetMedia {

        @Test
        @WithMockUser
        @DisplayName("성공 (200)")
        void getMedia_Success() throws Exception {
            SeriesMediaResponse response = new SeriesMediaResponse(1L, 1L, "series/uuid.png", MediaType.IMAGE);
            when(seriesMediaService.getMedia(1L)).thenReturn(response);

            mockMvc.perform(get("/api/series/1/medias"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.url").value("series/uuid.png"))
                    .andExpect(jsonPath("$.data.seriesId").value(1L));
        }

        @Test
        @WithMockUser
        @DisplayName("미디어 없음 → 200 (data: null)")
        void getMedia_NotFound() throws Exception {
            when(seriesMediaService.getMedia(999L)).thenReturn(null);

            mockMvc.perform(get("/api/series/999/medias"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").doesNotExist());
        }
    }

    @Nested
    @DisplayName("POST /api/series/{id}/medias 시리즈 썸네일 업로드")
    class UploadMedia {

        @Test
        @WithMockUser
        @DisplayName("성공 (201)")
        void uploadMedia_Success() throws Exception {
            SeriesMediaResponse response = new SeriesMediaResponse(1L, 1L, "series/uuid.png", MediaType.IMAGE);
            MockMultipartFile file = new MockMultipartFile("file", "thumb.png", "image/png", "content".getBytes());
            when(seriesMediaService.uploadMedia(anyLong(), any())).thenReturn(response);

            mockMvc.perform(multipart("/api/series/1/medias")
                            .file(file)
                            .with(csrf()))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.url").value("series/uuid.png"));
        }

        @Test
        @WithMockUser
        @DisplayName("시리즈 없음 → 404")
        void uploadMedia_SeriesNotFound() throws Exception {
            MockMultipartFile file = new MockMultipartFile("file", "thumb.png", "image/png", "content".getBytes());
            when(seriesMediaService.uploadMedia(anyLong(), any()))
                    .thenThrow(new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

            mockMvc.perform(multipart("/api/series/999/medias")
                            .file(file)
                            .with(csrf()))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /api/series/{id}/medias 시리즈 썸네일 삭제")
    class DeleteMedia {

        @Test
        @WithMockUser
        @DisplayName("성공 (200)")
        void deleteMedia_Success() throws Exception {
            mockMvc.perform(delete("/api/series/1/medias")
                            .with(csrf()))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser
        @DisplayName("미디어 없음 → 404")
        void deleteMedia_MediaNotFound() throws Exception {
            doThrow(new BusinessException(ErrorCode.RESOURCE_NOT_FOUND))
                    .when(seriesMediaService).deleteMedia(anyLong());

            mockMvc.perform(delete("/api/series/1/medias")
                            .with(csrf()))
                    .andExpect(status().isNotFound());
        }
    }
}
