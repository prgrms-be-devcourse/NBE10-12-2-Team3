package com.scommit.domain.post.post.controller;

import com.scommit.domain.post.post.dto.PostCreateRequest;
import com.scommit.domain.post.post.dto.PostListResponse;
import com.scommit.domain.post.post.dto.PostResponse;
import com.scommit.domain.post.post.dto.PostUpdateRequest;
import com.scommit.domain.post.post.service.PostService;
import com.scommit.global.dto.RsData;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@Tag(name = "Post", description = "게시글 관련 API")
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // GET /api/posts/me 내가 쓴 게시글 조회
    @Operation(summary = "내 게시글 조회", description = "로그인한 유저가 작성한 게시글 목록을 조회합니다.")
    @GetMapping("/me")
    public RsData<List<PostListResponse>> getMyPosts() {
        List<PostListResponse> response = postService.getMyPosts();
        return new RsData<>("200-1", "내가 쓴 게시글 목록입니다.", response);
    }

    // POST /api/posts 게시글 생성
    @Operation(summary = "게시글 생성", description = "새로운 게시글을 생성합니다.")
    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public RsData<PostResponse> createPost(
            @RequestBody PostCreateRequest request) {
        PostResponse response = postService.createPost(
                request.title(), request.body(), request.thumbnail(),
                request.publishStatus(), request.accessLevel(), request.seriesId());
        return new RsData<>("201-1", "게시글이 생성되었습니다.", response);
    }

    // GET /api/posts 게시글 전체 조회 / 특정 유저 게시글 조회
    @Operation(summary = "게시글 전체 조회", description = "전체 게시글 목록을 조회합니다. creatorId 입력 시 특정 유저의 게시글만 조회합니다.")
    @GetMapping
    public RsData<List<PostListResponse>> getPosts(
            @RequestParam(required = false) Long creatorId) {
        List<PostListResponse> response = postService.getPosts(creatorId);
        return new RsData<>("200-1", "게시글 목록입니다.", response);
    }

    // GET /api/posts/{id} 게시글 상세 조회
    @Operation(summary = "게시글 상세 조회", description = "게시글 ID로 특정 게시글의 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public RsData<PostResponse> getPost(@PathVariable Long id) {
        PostResponse response = postService.getPost(id);
        return new RsData<>("200-1", "게시글 상세 정보입니다.", response);
    }

    // PUT /api/posts/{id} 게시글 수정
    @Operation(summary = "게시글 수정", description = "게시글 ID로 특정 게시글을 수정합니다.")
    @PutMapping("/{id}")
    public RsData<PostResponse> updatePost(
            @PathVariable Long id,
            @RequestBody PostUpdateRequest request) {
        PostResponse response = postService.updatePost(id,
                request.title(), request.body(), request.thumbnail(),
                request.publishStatus(), request.accessLevel(), request.seriesId());
        return new RsData<>("200-1", "게시글이 수정되었습니다.", response);
    }

    // DELETE /api/posts/{id} 게시글 삭제
    @Operation(summary = "게시글 삭제", description = "게시글 ID로 특정 게시글을 삭제합니다.")
    @DeleteMapping("/{id}")
    public RsData<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return new RsData<>("200-1", "게시글이 삭제되었습니다.");
    }
}
