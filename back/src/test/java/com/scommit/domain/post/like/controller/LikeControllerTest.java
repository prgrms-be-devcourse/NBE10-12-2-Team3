package com.scommit.domain.post.like.controller;

import com.scommit.domain.post.like.service.LikeService;
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
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = LikeController.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtFilter.class)
)
class LikeControllerTest {

    private final User mockActor = new User(1L, "test@example.com", "테스터");
    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private LikeService likeService;
    @MockitoBean
    private SecurityHelper securityHelper;
    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Nested
    @DisplayName("POST /api/posts/{postId}/likes - 좋아요 추가")
    class CreateLike {

        @Test
        @WithMockUser
        @DisplayName("성공: 201 응답과 메시지를 반환한다")
        void createLike_success() throws Exception {
            when(securityHelper.getActor()).thenReturn(mockActor);

            mockMvc.perform(post("/api/posts/{postId}/likes", 1L)
                            .with(csrf()))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.resultCode").value("201-1"))
                    .andExpect(jsonPath("$.msg").value("좋아요가 추가되었습니다."));
        }

        @Test
        @WithMockUser
        @DisplayName("실패: 비로그인 사용자는 401을 반환한다")
        void createLike_unauthorized() throws Exception {
            when(securityHelper.getActor()).thenReturn(null);

            mockMvc.perform(post("/api/posts/{postId}/likes", 1L)
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser
        @DisplayName("실패: 존재하지 않는 게시글이면 404를 반환한다")
        void createLike_postNotFound() throws Exception {
            when(securityHelper.getActor()).thenReturn(mockActor);
            doThrow(new BusinessException(ErrorCode.POST_NOT_FOUND))
                    .when(likeService).createLike(eq(999L), any());

            mockMvc.perform(post("/api/posts/{postId}/likes", 999L)
                            .with(csrf()))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.resultCode").value("404-3"));
        }
    }

    @Nested
    @DisplayName("DELETE /api/posts/{postId}/likes - 좋아요 취소")
    class DeleteLike {

        @Test
        @WithMockUser
        @DisplayName("성공: 200 응답과 메시지를 반환한다")
        void deleteLike_success() throws Exception {
            when(securityHelper.getActor()).thenReturn(mockActor);

            mockMvc.perform(delete("/api/posts/{postId}/likes", 1L)
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.resultCode").value("200-1"))
                    .andExpect(jsonPath("$.msg").value("좋아요가 취소되었습니다."));
        }

        @Test
        @WithMockUser
        @DisplayName("실패: 비로그인 사용자는 401을 반환한다")
        void deleteLike_unauthorized() throws Exception {
            when(securityHelper.getActor()).thenReturn(null);

            mockMvc.perform(delete("/api/posts/{postId}/likes", 1L)
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser
        @DisplayName("실패: 존재하지 않는 게시글이면 404를 반환한다")
        void deleteLike_postNotFound() throws Exception {
            when(securityHelper.getActor()).thenReturn(mockActor);
            doThrow(new BusinessException(ErrorCode.POST_NOT_FOUND))
                    .when(likeService).deleteLike(eq(999L), any());

            mockMvc.perform(delete("/api/posts/{postId}/likes", 999L)
                            .with(csrf()))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.resultCode").value("404-3"));
        }

        @Test
        @WithMockUser
        @DisplayName("실패: 좋아요가 없으면 404를 반환한다")
        void deleteLike_likeNotFound() throws Exception {
            when(securityHelper.getActor()).thenReturn(mockActor);
            doThrow(new BusinessException(ErrorCode.RESOURCE_NOT_FOUND))
                    .when(likeService).deleteLike(eq(1L), any());

            mockMvc.perform(delete("/api/posts/{postId}/likes", 1L)
                            .with(csrf()))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.resultCode").value("404-1"));
        }
    }
}
