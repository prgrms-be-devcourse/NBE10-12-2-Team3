package com.scommit.domain.post.bookmark.controller;

import com.scommit.domain.post.bookmark.service.BookmarkService;
import com.scommit.domain.post.post.dto.PostListResponse;
import com.scommit.domain.post.post.entity.PostAccessLevel;
import com.scommit.domain.post.post.entity.PublishStatus;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = BookmarkController.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtFilter.class)
)
class BookmarkControllerTest {

    private final User mockActor = new User(1L, "test@example.com", "테스터");
    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private BookmarkService bookmarkService;
    @MockitoBean
    private SecurityHelper securityHelper;
    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Nested
    @DisplayName("POST /api/posts/{postId}/bookmarks - 북마크 추가")
    class CreateBookmark {

        @Test
        @WithMockUser
        @DisplayName("성공: 201 응답과 메시지를 반환한다")
        void createBookmark_success() throws Exception {
            when(securityHelper.getActor()).thenReturn(mockActor);

            mockMvc.perform(post("/api/posts/{postId}/bookmarks", 1L)
                            .with(csrf()))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.resultCode").value("201-1"))
                    .andExpect(jsonPath("$.msg").value("북마크가 추가되었습니다."));
        }

        @Test
        @WithMockUser
        @DisplayName("실패: 비로그인 사용자는 401을 반환한다")
        void createBookmark_unauthorized() throws Exception {
            when(securityHelper.getActor()).thenReturn(null);

            mockMvc.perform(post("/api/posts/{postId}/bookmarks", 1L)
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser
        @DisplayName("실패: 존재하지 않는 게시글이면 404를 반환한다")
        void createBookmark_postNotFound() throws Exception {
            when(securityHelper.getActor()).thenReturn(mockActor);
            doThrow(new BusinessException(ErrorCode.POST_NOT_FOUND))
                    .when(bookmarkService).createBookmark(eq(999L), any());

            mockMvc.perform(post("/api/posts/{postId}/bookmarks", 999L)
                            .with(csrf()))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.resultCode").value("404-3"));
        }
    }

    @Nested
    @DisplayName("GET /api/bookmarks/me - 내 북마크 목록 조회")
    class GetMyBookmarks {

        @Test
        @WithMockUser
        @DisplayName("성공: 북마크한 게시글 목록을 반환한다")
        void getMyBookmarks_success() throws Exception {
            PostListResponse response = new PostListResponse(
                    10L, 2L, "작성자", null, "제목", PublishStatus.PUBLIC,
                    PostAccessLevel.FREE, 0L, 5L, 1L, false, true, LocalDateTime.now()
            );
            Page<PostListResponse> page = new PageImpl<>(List.of(response));

            when(securityHelper.getActor()).thenReturn(mockActor);
            when(bookmarkService.getMyBookmarks(any(), any(Pageable.class))).thenReturn(page);

            mockMvc.perform(get("/api/bookmarks/me"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.resultCode").value("200-1"))
                    .andExpect(jsonPath("$.data.content.length()").value(1))
                    .andExpect(jsonPath("$.data.content[0].id").value(10L))
                    .andExpect(jsonPath("$.data.content[0].isBookmarked").value(true));
        }

        @Test
        @WithMockUser
        @DisplayName("성공: 북마크가 없으면 빈 목록을 반환한다")
        void getMyBookmarks_empty() throws Exception {
            Page<PostListResponse> emptyPage = new PageImpl<>(List.of());

            when(securityHelper.getActor()).thenReturn(mockActor);
            when(bookmarkService.getMyBookmarks(any(), any(Pageable.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/api/bookmarks/me"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content.length()").value(0));
        }

        @Test
        @WithMockUser
        @DisplayName("실패: 비로그인 사용자는 401을 반환한다")
        void getMyBookmarks_unauthorized() throws Exception {
            when(securityHelper.getActor()).thenReturn(null);

            mockMvc.perform(get("/api/bookmarks/me"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("DELETE /api/posts/{postId}/bookmarks - 북마크 취소")
    class DeleteBookmark {

        @Test
        @WithMockUser
        @DisplayName("성공: 200 응답과 메시지를 반환한다")
        void deleteBookmark_success() throws Exception {
            when(securityHelper.getActor()).thenReturn(mockActor);

            mockMvc.perform(delete("/api/posts/{postId}/bookmarks", 1L)
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.resultCode").value("200-1"))
                    .andExpect(jsonPath("$.msg").value("북마크가 취소되었습니다."));
        }

        @Test
        @WithMockUser
        @DisplayName("실패: 비로그인 사용자는 401을 반환한다")
        void deleteBookmark_unauthorized() throws Exception {
            when(securityHelper.getActor()).thenReturn(null);

            mockMvc.perform(delete("/api/posts/{postId}/bookmarks", 1L)
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser
        @DisplayName("실패: 존재하지 않는 게시글이면 404를 반환한다")
        void deleteBookmark_postNotFound() throws Exception {
            when(securityHelper.getActor()).thenReturn(mockActor);
            doThrow(new BusinessException(ErrorCode.POST_NOT_FOUND))
                    .when(bookmarkService).deleteBookmark(eq(999L), any());

            mockMvc.perform(delete("/api/posts/{postId}/bookmarks", 999L)
                            .with(csrf()))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.resultCode").value("404-3"));
        }

        @Test
        @WithMockUser
        @DisplayName("실패: 북마크가 없으면 404를 반환한다")
        void deleteBookmark_bookmarkNotFound() throws Exception {
            when(securityHelper.getActor()).thenReturn(mockActor);
            doThrow(new BusinessException(ErrorCode.RESOURCE_NOT_FOUND))
                    .when(bookmarkService).deleteBookmark(eq(1L), any());

            mockMvc.perform(delete("/api/posts/{postId}/bookmarks", 1L)
                            .with(csrf()))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.resultCode").value("404-1"));
        }
    }
}
