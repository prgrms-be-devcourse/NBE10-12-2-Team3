package com.scommit.domain.user.user.service;

import com.scommit.domain.user.user.entity.User;
import com.scommit.domain.user.user.repository.UserRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Nested
    @DisplayName("회원가입")
    class SignUp {

        private static final String EMAIL = "test@example.com";
        private static final String PASSWORD = "password123";
        private static final String NICKNAME = "testuser";

        @Test
        @DisplayName("성공: 이메일과 닉네임이 중복되지 않으면 유저를 저장하고 반환한다.")
        void signUp_Success() {
            // Given
            given(userRepository.existsByEmail(EMAIL)).willReturn(false);
            given(userRepository.existsByNickname(NICKNAME)).willReturn(false);
            given(passwordEncoder.encode(PASSWORD)).willReturn("encodedPassword");

            User savedUser = User.builder()
                    .email(EMAIL)
                    .password("encodedPassword")
                    .nickname(NICKNAME)
                    .build();
            given(userRepository.save(any(User.class))).willReturn(savedUser);

            // When
            User result = userService.signUp(EMAIL, PASSWORD, NICKNAME);

            // Then
            assertThat(result.getEmail()).isEqualTo(EMAIL);
            assertThat(result.getNickname()).isEqualTo(NICKNAME);
            assertThat(result.getPassword()).isEqualTo("encodedPassword");
            verify(passwordEncoder).encode(PASSWORD);
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("성공: 저장 시 평문 비밀번호가 아닌 인코딩된 비밀번호가 사용된다.")
        void signUp_PasswordIsEncoded() {
            // Given
            given(userRepository.existsByEmail(EMAIL)).willReturn(false);
            given(userRepository.existsByNickname(NICKNAME)).willReturn(false);
            given(passwordEncoder.encode(PASSWORD)).willReturn("encodedPassword");
            given(userRepository.save(any(User.class))).willAnswer(invocation -> invocation.getArgument(0));

            // When
            User result = userService.signUp(EMAIL, PASSWORD, NICKNAME);

            // Then
            assertThat(result.getPassword()).isNotEqualTo(PASSWORD);
            assertThat(result.getPassword()).isEqualTo("encodedPassword");
        }

        @Test
        @DisplayName("실패: 이메일이 중복되면 DUPLICATE_EMAIL 예외를 던진다.")
        void signUp_DuplicateEmail() {
            // Given
            given(userRepository.existsByEmail(EMAIL)).willReturn(true);

            // When & Then
            assertThatThrownBy(() -> userService.signUp(EMAIL, PASSWORD, NICKNAME))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DUPLICATE_EMAIL);

            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("실패: 닉네임이 중복되면 예외를 던지고 저장하지 않는다.")
        void signUp_DuplicateNickname() {
            // Given
            given(userRepository.existsByEmail(EMAIL)).willReturn(false);
            given(userRepository.existsByNickname(NICKNAME)).willReturn(true);

            // When & Then
            assertThatThrownBy(() -> userService.signUp(EMAIL, PASSWORD, NICKNAME))
                    .isInstanceOf(BusinessException.class);

            verify(userRepository, never()).save(any(User.class));
            verify(passwordEncoder, never()).encode(anyString());
        }
    }
}
