package com.scommit.domain.series.controller;

import tools.jackson.databind.ObjectMapper;
import com.scommit.domain.series.dto.SeriesCreateRequest;
import com.scommit.domain.series.dto.SeriesUpdateRequest;
import com.scommit.domain.series.entity.Series;
import com.scommit.domain.series.service.SeriesService;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SeriesController.class)
class SeriesControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SeriesService seriesService;

    private Series createMockSeries(Long id, Long userId, String title, String body) {
        Series series = org.mockito.Mockito.mock(Series.class);
        com.scommit.domain.user.entity.User user = org.mockito.Mockito.mock(com.scommit.domain.user.entity.User.class);
        org.mockito.Mockito.when(user.getId()).thenReturn(userId);
        org.mockito.Mockito.when(series.getId()).thenReturn(id);
        org.mockito.Mockito.when(series.getUser()).thenReturn(user);
        org.mockito.Mockito.when(series.getTitle()).thenReturn(title);
        org.mockito.Mockito.when(series.getBody()).thenReturn(body);
        return series;
    }

    @Test
    @WithMockUser
    @DisplayName("POST /series - 새 시리즈 생성 성공")
    void createSeries_Success() throws Exception {
        SeriesCreateRequest request = new SeriesCreateRequest(1L, "시리즈 제목", "시리즈 설명");
        Series mockSeries = createMockSeries(1L, 1L, "시리즈 제목", "시리즈 설명");

        org.mockito.Mockito.when(seriesService.create(any(SeriesCreateRequest.class))).thenReturn(mockSeries);

        mockMvc.perform(post("/series")
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
    @DisplayName("GET /series - 시리즈 전체 조회 성공")
    void getAllSeries_Success() throws Exception {
        List<Series> mockSeriesList = List.of(
                createMockSeries(1L, 1L, "제목 1", "설명 1"),
                createMockSeries(2L, 2L, "제목 2", "설명 2")
        );

        org.springframework.data.domain.Page<Series> mockPage = new org.springframework.data.domain.PageImpl<>(mockSeriesList);

        org.mockito.Mockito.when(seriesService.findAll(eq(null), anyInt())).thenReturn(mockPage);

        mockMvc.perform(get("/series"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").value(2))
                .andExpect(jsonPath("$.data.content[0].title").value("제목 1"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /series/{id} - 시리즈 상세 조회 성공")
    void getSeriesDetail_Success() throws Exception {
        Series mockSeries = createMockSeries(1L, 1L, "제목 1", "설명 1");

        org.mockito.Mockito.when(seriesService.findById(1L)).thenReturn(mockSeries);

        mockMvc.perform(get("/series/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("제목 1"));
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /series/{id} - 시리즈 수정 성공")
    void updateSeries_Success() throws Exception {
        SeriesUpdateRequest request = new SeriesUpdateRequest("수정된 제목", "수정된 설명");
        Series mockSeries = createMockSeries(1L, 1L, "수정된 제목", "수정된 설명");

        org.mockito.Mockito.when(seriesService.update(eq(1L), any(SeriesUpdateRequest.class))).thenReturn(mockSeries);
        org.mockito.Mockito.when(seriesService.findById(1L)).thenReturn(mockSeries);

        mockMvc.perform(put("/series/{id}", 1L)
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("수정된 제목"));
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /series/{id} - 시리즈 삭제 성공")
    void deleteSeries_Success() throws Exception {
        mockMvc.perform(delete("/series/{id}", 1L)
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /series?creatorId={id} - 특정 유저의 시리즈 전체 조회 성공")
    void getSeriesByCreator_Success() throws Exception {
        List<Series> mockSeriesList = List.of(
                createMockSeries(1L, 1L, "크리에이터 제목", "크리에이터 설명")
        );

        org.springframework.data.domain.Page<Series> mockPage = new org.springframework.data.domain.PageImpl<>(mockSeriesList);

        org.mockito.Mockito.when(seriesService.findAll(eq(1L), anyInt())).thenReturn(mockPage);

        mockMvc.perform(get("/series").param("creatorId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").value(1))
                .andExpect(jsonPath("$.data.content[0].title").value("크리에이터 제목"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /series - 입력값 유효성 검증 실패 (400 Bad Request)")
    void createSeries_ValidationError() throws Exception {
        // Given
        SeriesCreateRequest request = new SeriesCreateRequest(null, "", "설명");

        // When & Then
        mockMvc.perform(post("/series")
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("POST /series - 존재하지 않는 사용자 ID로 시리즈 생성 실패 (404 Not Found)")
    void createSeries_UserNotFound() throws Exception {
        // Given
        SeriesCreateRequest request = new SeriesCreateRequest(999L, "제목", "설명");
        org.mockito.Mockito.when(seriesService.create(any(SeriesCreateRequest.class)))
                .thenThrow(new BusinessException(ErrorCode.USER_NOT_FOUND));

        // When & Then
        mockMvc.perform(post("/series")
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.resultCode").value("404-2"));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /series/{id} - 존재하지 않는 시리즈 상세 조회 실패 (404 Not Found)")
    void getSeriesDetail_NotFound() throws Exception {
        // Given
        org.mockito.Mockito.when(seriesService.findById(999L))
                .thenThrow(new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        // When & Then
        mockMvc.perform(get("/series/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.resultCode").value("404-1"));
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /series/{id} - 입력값 유효성 검증 실패 (400 Bad Request)")
    void updateSeries_ValidationError() throws Exception {
        // Given
        SeriesUpdateRequest request = new SeriesUpdateRequest("", "설명");

        // When & Then
        mockMvc.perform(put("/series/{id}", 1L)
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /series/{id} - 존재하지 않는 시리즈 수정 실패 (404 Not Found)")
    void updateSeries_NotFound() throws Exception {
        // Given
        SeriesUpdateRequest request = new SeriesUpdateRequest("수정 제목", "수정 설명");
        org.mockito.Mockito.when(seriesService.update(eq(999L), any(SeriesUpdateRequest.class)))
                .thenThrow(new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        // When & Then
        mockMvc.perform(put("/series/{id}", 999L)
                        .with(csrf())
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.resultCode").value("404-1"));
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /series/{id} - 존재하지 않는 시리즈 삭제 실패 (404 Not Found)")
    void deleteSeries_NotFound() throws Exception {
        // Given
        org.mockito.Mockito.doThrow(new BusinessException(ErrorCode.RESOURCE_NOT_FOUND))
                .when(seriesService).delete(999L);

        // When & Then
        mockMvc.perform(delete("/series/{id}", 999L)
                        .with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.resultCode").value("404-1"));
    }
}
