package com.scommit.domain.media.service;

import com.scommit.domain.media.entity.Media;
import com.scommit.domain.media.entity.MediaType;
import com.scommit.domain.media.repository.MediaRepository;
import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.post.post.repository.PostRepository;
import com.scommit.global.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MediaServiceTest {

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private MediaService mediaService;

    // 테스트용 파일 저장 경로 (프로젝트 폴더 내부에 쓰레기 파일이 쌓이지 않도록 임시 폴더 사용)
    private final String testMediaPath = "back/build/tmp/test-media/";

    @BeforeEach
    void setUp() throws IOException {
        // @Value 로 주입받는 값을 리플렉션으로 강제 주입
        ReflectionTestUtils.setField(mediaService, "mediaPath", testMediaPath);
        
        // 테스트 전 임시 폴더 생성
        Files.createDirectories(Paths.get(testMediaPath));
    }

    @Test
    @DisplayName("미디어 업로드 성공 테스트")
    void create_Success() {
        // given
        Long postId = 1L;
        Post mockPost = mock(Post.class);
        when(postRepository.findById(postId)).thenReturn(Optional.of(mockPost));

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-image.png",
                "image/png",
                "dummy image content".getBytes()
        );

        Media mockSavedMedia = Media.builder()
                .post(mockPost)
                .url("uuid_test-image.png")
                .type(MediaType.IMAGE)
                .build();
        
        when(mediaRepository.save(any(Media.class))).thenReturn(mockSavedMedia);

        // when
        Media result = mediaService.create(postId, file);

        // then
        assertNotNull(result);
        assertEquals(MediaType.IMAGE, result.getType());
        verify(postRepository, times(1)).findById(postId);
        verify(mediaRepository, times(1)).save(any(Media.class));
    }

    @Test
    @DisplayName("파일이 비어있을 때 업로드 실패 테스트")
    void create_Fail_EmptyFile() {
        // given
        Long postId = 1L;
        Post mockPost = mock(Post.class);
        when(postRepository.findById(postId)).thenReturn(Optional.of(mockPost));

        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.png",
                "image/png",
                new byte[0] // 빈 파일
        );

        // when & then
        assertThrows(BusinessException.class, () -> mediaService.create(postId, emptyFile));
    }

    @Test
    @DisplayName("존재하지 않는 게시글에 미디어 업로드 실패 테스트")
    void create_Fail_PostNotFound() {
        // given
        Long postId = 999L;
        when(postRepository.findById(postId)).thenReturn(Optional.empty());

        MockMultipartFile file = new MockMultipartFile(
                "file", "test.png", "image/png", "test".getBytes()
        );

        // when & then
        assertThrows(BusinessException.class, () -> mediaService.create(postId, file));
    }

    @Test
        @DisplayName("지원하지 않는 파일 형식 업로드 실패 테스트 (.pdf 등)")
        void create_Fail_InvalidMediaType () {
            // given
            Long postId = 1L;
            Post mockPost = mock(Post.class);
            when(postRepository.findById(postId)).thenReturn(Optional.of(mockPost));

            MockMultipartFile file = new MockMultipartFile(
                    "file", "test.pdf", "application/pdf", "dummy pdf content".getBytes()
            );

            // when & then
            assertThrows(BusinessException.class, () -> mediaService.create(postId, file));
        }

        @Test
        @DisplayName("미디어 삭제 성공 테스트 (DB 데이터 및 실제 하드디스크 파일 삭제)")
        void delete_Success () throws IOException {
            // given
            Long mediaId = 1L;
            String dummyFileName = "delete-test-image.png";

            // 미리 지워질 가짜 파일을 하드디스크(임시 폴더)에 생성해두기
            Path dummyFilePath = Paths.get(testMediaPath + dummyFileName);
            Files.write(dummyFilePath, "dummy content".getBytes());
            assertTrue(Files.exists(dummyFilePath)); // 파일이 진짜 생성됐는지 확인

            Media mockMedia = Media.builder()
                    .url(dummyFileName)
                    .type(MediaType.IMAGE)
                    .build();

            when(mediaRepository.findById(mediaId)).thenReturn(Optional.of(mockMedia));

            // when
            mediaService.delete(mediaId);

            // then
            verify(mediaRepository, times(1)).delete(mockMedia);
            assertFalse(Files.exists(dummyFilePath)); // 💡 제일 중요: 하드디스크에서 진짜 지워졌는지 검증!
        }

        @Test
        @DisplayName("존재하지 않는 미디어 삭제 시도 시 에러 튕겨내기")
        void delete_Fail_MediaNotFound () {
            // given
            Long mediaId = 999L;
            when(mediaRepository.findById(mediaId)).thenReturn(Optional.empty());

            // when & then
            assertThrows(BusinessException.class, () -> mediaService.delete(mediaId));
        }
}
