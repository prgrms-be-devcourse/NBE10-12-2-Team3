package com.scommit.domain.series.series.controller;

import com.scommit.domain.media.media.entity.MediaType;
import com.scommit.domain.post.post.service.PostService;
import com.scommit.domain.series.series.dto.SeriesCreateRequest;
import com.scommit.domain.series.series.dto.SeriesListResponse;
import com.scommit.domain.series.series.dto.SeriesResponse;
import com.scommit.domain.series.series.dto.SeriesUpdateRequest;
import com.scommit.domain.series.series.service.SeriesService;
import com.scommit.domain.series.seriesmedia.dto.SeriesMediaResponse;
import com.scommit.domain.series.seriesmedia.service.SeriesMediaService;
import com.scommit.domain.user.user.entity.User;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import com.scommit.global.security.SecurityHelper;
import com.scommit.global.security.jwt.JwtFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
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

    private final User mockActor = new User(1L, "test@example.com", "테스터");
    @MockitoBean
    private PostService postService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;
    @MockitoBean
    private SecurityHelper securityHelper;

    private SeriesResponse createMockSeriesResponse(Long id, Long userId, String title, String body) {
        return new SeriesResponse(id, userId, "테스터", title, body, null, null);
    }

    private SeriesListResponse createMockSeriesListResponse(Long id, Long userId, String title) {
        return new SeriesListResponse(id, userId, "테스터", title, null, 0L, null, null, null);
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/series - 새 시리즈 생성 성공")
    void createSeries_Success() throws Exception {
        SeriesCreateRequest request = new SeriesCreateRequest("시리즈 제목", "시리즈 설명");
        SeriesResponse mockResponse = createMockSeriesResponse(1L, 1L, "시리즈 제목", "시리즈 설명");

        when(securityHelper.getActor()).thenReturn(mockActor);
        when(seriesService.createSeries(anyString(), anyString(), anyLong())).thenReturn(mockResponse);

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
    @DisplayName("POST /api/series - 비인증 사용자 시리즈 생성 시도 실패 (401)")
    void createSeries_Unauthorized() throws Exception {
        SeriesCreateRequest request = new SeriesCreateRequest("시리즈 제목", "시리즈 설명");
        when(securityHelper.getActor()).thenReturn(null);

        mockMvc.perform(post("/api/series")
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/series - 시리즈 전체 조회 성공 (무한 스크롤)")
    void getAllSeries_Success() throws Exception {
        List<SeriesListResponse> mockSeriesList = List.of(
                createMockSeriesListResponse(1L, 1L, "제목 1"),
                createMockSeriesListResponse(2L, 2L, "제목 2")
        );

        Slice<SeriesListResponse> mockSlice = new SliceImpl<>(mockSeriesList);

        when(seriesService.getSeriesSlice(any(Pageable.class))).thenReturn(mockSlice);

        mockMvc.perform(get("/api/series"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").value(2))
                .andExpect(jsonPath("$.data.content[0].title").value("제목 1"))
                .andExpect(jsonPath("$.data.last").value(true));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/series/users/{userId} - 특정 유저의 시리즈 조회 성공")
    void getSeriesByUser_Success() throws Exception {
        List<SeriesListResponse> mockSeriesList = List.of(
                createMockSeriesListResponse(1L, 1L, "크리에이터 제목")
        );

        Page<SeriesListResponse> mockPage = new PageImpl<>(mockSeriesList);

        when(seriesService.getSeriesList(eq(1L), any(Pageable.class))).thenReturn(mockPage);

        mockMvc.perform(get("/api/series/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").value(1))
                .andExpect(jsonPath("$.data.content[0].title").value("크리에이터 제목"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/series/search?keyword=X - 시리즈 제목 검색 성공")
    void searchSeries_Success() throws Exception {
        List<SeriesListResponse> mockSeriesList = List.of(
                createMockSeriesListResponse(1L, 1L, "Spring 입문")
        );

        Page<SeriesListResponse> mockPage = new PageImpl<>(mockSeriesList);

        when(seriesService.searchSeries(eq("Spring"), any(Pageable.class))).thenReturn(mockPage);

        mockMvc.perform(get("/api/series/search").param("keyword", "Spring"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").value(1))
                .andExpect(jsonPath("$.data.content[0].title").value("Spring 입문"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/series/me - 내 시리즈 조회 성공")
    void getMySeriesList_Success() throws Exception {
        List<SeriesListResponse> mockSeriesList = List.of(
                createMockSeriesListResponse(1L, 1L, "내 시리즈")
        );
        Page<SeriesListResponse> mockPage = new PageImpl<>(mockSeriesList);

        when(securityHelper.getActor()).thenReturn(mockActor);
        when(seriesService.getSeriesList(eq(1L), any(Pageable.class))).thenReturn(mockPage);

        mockMvc.perform(get("/api/series/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].title").value("내 시리즈"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/series/me - 비인증 사용자 접근 실패 (401)")
    void getMySeriesList_Unauthorized() throws Exception {
        when(securityHelper.getActor()).thenReturn(null);

        mockMvc.perform(get("/api/series/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/series/{id} - 시리즈 상세 조회 성공")
    void getSeriesDetail_Success() throws Exception {
        SeriesResponse mockResponse = createMockSeriesResponse(1L, 1L, "제목 1", "설명 1");

        when(seriesService.getSeries(1L)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/series/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("제목 1"));
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
    @DisplayName("PUT /api/series/{id} - 시리즈 수정 성공")
    void updateSeries_Success() throws Exception {
        SeriesUpdateRequest request = new SeriesUpdateRequest("수정된 제목", "수정된 설명");
        SeriesResponse mockResponse = createMockSeriesResponse(1L, 1L, "수정된 제목", "수정된 설명");

        when(securityHelper.getActor()).thenReturn(mockActor);
        when(seriesService.updateSeries(eq(1L), anyString(), anyString(), anyLong(), any())).thenReturn(mockResponse);

        mockMvc.perform(put("/api/series/{id}", 1L)
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("수정된 제목"));
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /api/series/{id} - 타인 시리즈 수정 시도 실패 (403)")
    void updateSeries_Forbidden() throws Exception {
        SeriesUpdateRequest request = new SeriesUpdateRequest("수정된 제목", "수정된 설명");
        User otherActor = new User(99L, "other@example.com", "다른유저");

        when(securityHelper.getActor()).thenReturn(otherActor);
        when(seriesService.updateSeries(eq(1L), anyString(), anyString(), eq(99L), any()))
                .thenThrow(new BusinessException(ErrorCode.ACCESS_DENIED));

        mockMvc.perform(put("/api/series/{id}", 1L)
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.resultCode").value("403-1"));
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

        when(securityHelper.getActor()).thenReturn(mockActor);
        when(seriesService.updateSeries(eq(999L), anyString(), anyString(), anyLong(), any()))
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
    @DisplayName("DELETE /api/series/{id} - 시리즈 삭제 성공")
    void deleteSeries_Success() throws Exception {
        when(securityHelper.getActor()).thenReturn(mockActor);

        mockMvc.perform(delete("/api/series/{id}", 1L)
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/series/{id} - 타인 시리즈 삭제 시도 실패 (403)")
    void deleteSeries_Forbidden() throws Exception {
        User otherActor = new User(99L, "other@example.com", "다른유저");
        when(securityHelper.getActor()).thenReturn(otherActor);
        doThrow(new BusinessException(ErrorCode.ACCESS_DENIED))
                .when(seriesService).deleteSeries(eq(1L), eq(99L), any());

        mockMvc.perform(delete("/api/series/{id}", 1L)
                        .with(csrf()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.resultCode").value("403-1"));
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /api/series/{id} - 존재하지 않는 시리즈 삭제 실패 (404 Not Found)")
    void deleteSeries_NotFound() throws Exception {
        when(securityHelper.getActor()).thenReturn(mockActor);
        doThrow(new BusinessException(ErrorCode.RESOURCE_NOT_FOUND))
                .when(seriesService).deleteSeries(eq(999L), anyLong(), any());

        mockMvc.perform(delete("/api/series/{id}", 999L)
                        .with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.resultCode").value("404-1"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/series - 입력값 유효성 검증 실패 (400 Bad Request)")
    void createSeries_ValidationError() throws Exception {
        SeriesCreateRequest request = new SeriesCreateRequest("", "설명");

        when(securityHelper.getActor()).thenReturn(mockActor);

        mockMvc.perform(post("/api/series")
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
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

            when(securityHelper.getActor()).thenReturn(mockActor);
            when(seriesMediaService.uploadMedia(anyLong(), any(), anyLong(), any())).thenReturn(response);

            mockMvc.perform(multipart("/api/series/1/medias")
                            .file(file)
                            .with(csrf()))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.url").value("series/uuid.png"));
        }

        @Test
        @WithMockUser
        @DisplayName("타인 시리즈에 썸네일 업로드 시도 실패 (403)")
        void uploadMedia_Forbidden() throws Exception {
            MockMultipartFile file = new MockMultipartFile("file", "thumb.png", "image/png", "content".getBytes());
            User otherActor = new User(99L, "other@example.com", "다른유저");

            when(securityHelper.getActor()).thenReturn(otherActor);
            when(seriesMediaService.uploadMedia(anyLong(), any(), eq(99L), any()))
                    .thenThrow(new BusinessException(ErrorCode.ACCESS_DENIED));

            mockMvc.perform(multipart("/api/series/1/medias")
                            .file(file)
                            .with(csrf()))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.resultCode").value("403-1"));
        }

        @Test
        @WithMockUser
        @DisplayName("시리즈 없음 → 404")
        void uploadMedia_SeriesNotFound() throws Exception {
            MockMultipartFile file = new MockMultipartFile("file", "thumb.png", "image/png", "content".getBytes());

            when(securityHelper.getActor()).thenReturn(mockActor);
            when(seriesMediaService.uploadMedia(anyLong(), any(), anyLong(), any()))
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
            when(securityHelper.getActor()).thenReturn(mockActor);

            mockMvc.perform(delete("/api/series/1/medias")
                            .with(csrf()))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser
        @DisplayName("타인 시리즈 썸네일 삭제 시도 실패 (403)")
        void deleteMedia_Forbidden() throws Exception {
            User otherActor = new User(99L, "other@example.com", "다른유저");
            when(securityHelper.getActor()).thenReturn(otherActor);
            doThrow(new BusinessException(ErrorCode.ACCESS_DENIED))
                    .when(seriesMediaService).deleteMedia(eq(1L), eq(99L), any());

            mockMvc.perform(delete("/api/series/1/medias")
                            .with(csrf()))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.resultCode").value("403-1"));
        }

        @Test
        @WithMockUser
        @DisplayName("미디어 없음 → 404")
        void deleteMedia_MediaNotFound() throws Exception {
            when(securityHelper.getActor()).thenReturn(mockActor);
            doThrow(new BusinessException(ErrorCode.RESOURCE_NOT_FOUND))
                    .when(seriesMediaService).deleteMedia(anyLong(), anyLong(), any());

            mockMvc.perform(delete("/api/series/1/medias")
                            .with(csrf()))
                    .andExpect(status().isNotFound());
        }
    }
}
