package com.scommit.domain.user.user.controller;

import tools.jackson.databind.ObjectMapper;
import com.scommit.domain.user.user.dto.SignupRequest;
import com.scommit.domain.user.user.entity.User;
import com.scommit.domain.user.user.service.UserService;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import com.scommit.global.security.SecurityConfig;
import com.scommit.global.security.jwt.JwtFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = UserController.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtFilter.class)
)
@Import(SecurityConfig.class)
@AutoConfigureMockMvc(addFilters = false)
public class UserControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @MockitoBean
    private JwtFilter jwtFilter;

    @Nested
    @DisplayName("POST /api/users/signup 회원가입")
    class Signup {

        private static final String SIGNUP_URL = "/api/users/signup";
        private static final String VALID_EMAIL = "test@example.com";
        private static final String VALID_PASSWORD = "password123";
        private static final String VALID_NICKNAME = "testuser";

        @Test
        @DisplayName("성공 (201)")
        void signup_Success() throws Exception {
            User mockUser = mock(User.class);
            given(mockUser.getId()).willReturn(1L);
            given(mockUser.getEmail()).willReturn(VALID_EMAIL);
            given(mockUser.getNickname()).willReturn(VALID_NICKNAME);
            given(mockUser.getCreatedAt()).willReturn(LocalDateTime.now());
            given(userService.signUp(anyString(), anyString(), anyString())).willReturn(mockUser);

            SignupRequest request = new SignupRequest(VALID_EMAIL, VALID_PASSWORD, VALID_NICKNAME);

            mvc.perform(post(SIGNUP_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.resultCode").value("201-1"))
                    .andExpect(jsonPath("$.data.email").value(VALID_EMAIL))
                    .andExpect(jsonPath("$.data.nickname").value(VALID_NICKNAME))
                    .andExpect(jsonPath("$.data.id").isNumber());
        }

        @Test
        @DisplayName("이메일 중복 → DUPLICATE_EMAIL (409)")
        void signup_DuplicateEmail() throws Exception {
            given(userService.signUp(anyString(), anyString(), anyString()))
                    .willThrow(new BusinessException(ErrorCode.DUPLICATE_EMAIL));

            SignupRequest request = new SignupRequest(VALID_EMAIL, VALID_PASSWORD, VALID_NICKNAME);

            mvc.perform(post(SIGNUP_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.resultCode").value("409-1"))
                    .andExpect(jsonPath("$.msg").value("이미 사용중인 이메일입니다."));
        }

        @Test
        @DisplayName("닉네임 중복 → 409")
        void signup_DuplicateNickname() throws Exception {
            given(userService.signUp(anyString(), anyString(), anyString()))
                    .willThrow(new BusinessException(ErrorCode.DUPLICATE_EMAIL));

            SignupRequest request = new SignupRequest(VALID_EMAIL, VALID_PASSWORD, VALID_NICKNAME);

            mvc.perform(post(SIGNUP_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.resultCode").value("409-1"));
        }

        @Test
        @DisplayName("이메일 누락 → 400")
        void signup_BlankEmail() throws Exception {
            SignupRequest request = new SignupRequest("", VALID_PASSWORD, VALID_NICKNAME);

            mvc.perform(post(SIGNUP_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.resultCode").value("400-1"));
        }

        @Test
        @DisplayName("이메일 형식 오류 → 400")
        void signup_InvalidEmailFormat() throws Exception {
            SignupRequest request = new SignupRequest("not-an-email", VALID_PASSWORD, VALID_NICKNAME);

            mvc.perform(post(SIGNUP_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.resultCode").value("400-1"));
        }

        @Test
        @DisplayName("비밀번호 누락 → 400")
        void signup_BlankPassword() throws Exception {
            SignupRequest request = new SignupRequest(VALID_EMAIL, "", VALID_NICKNAME);

            mvc.perform(post(SIGNUP_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.resultCode").value("400-1"));
        }

        @Test
        @DisplayName("비밀번호 6자 미만 → 400")
        void signup_PasswordTooShort() throws Exception {
            SignupRequest request = new SignupRequest(VALID_EMAIL, "12345", VALID_NICKNAME);

            mvc.perform(post(SIGNUP_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.resultCode").value("400-1"));
        }

        @Test
        @DisplayName("닉네임 누락 → 400")
        void signup_BlankNickname() throws Exception {
            SignupRequest request = new SignupRequest(VALID_EMAIL, VALID_PASSWORD, "");

            mvc.perform(post(SIGNUP_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.resultCode").value("400-1"));
        }

        @Test
        @DisplayName("닉네임 2자 미만 → 400")
        void signup_NicknameTooShort() throws Exception {
            SignupRequest request = new SignupRequest(VALID_EMAIL, VALID_PASSWORD, "a");

            mvc.perform(post(SIGNUP_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.resultCode").value("400-1"));
        }

        @Test
        @DisplayName("닉네임 20자 초과 → 400")
        void signup_NicknameTooLong() throws Exception {
            SignupRequest request = new SignupRequest(VALID_EMAIL, VALID_PASSWORD, "a".repeat(21));

            mvc.perform(post(SIGNUP_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.resultCode").value("400-1"));
        }
    }
}
