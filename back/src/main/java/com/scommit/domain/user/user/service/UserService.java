package com.scommit.domain.user.user.service;

import com.scommit.domain.user.user.entity.User;
import com.scommit.domain.user.user.entity.UserRole;
import com.scommit.domain.user.user.repository.UserRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    @Transactional
    public User signUp(String email, String password, String nickname) {
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        if (userRepository.existsByNickname(nickname)) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL); // TODO: ErrorCode 모은 후 DUPLICATE_NICKNAME 등으로 수정
        }

        String encodedPassword = passwordEncoder.encode(password);
        User user = User.builder()
                .email(email)
                .password(encodedPassword)
                .nickname(nickname)
                .role(UserRole.USER)
                .build();
        user.resetRefreshToken();
        return userRepository.save(user);
    }

    public Optional<User> getUserByRefreshToken(String refreshToken) {
        return userRepository.findByRefreshTokenAndDeletedAtIsNull(refreshToken);
    }

    public User login(String email, String password) {
        Optional<User> user = userRepository.findByEmailAndDeletedAtIsNull(email);
        if (user.isEmpty()) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND); // TODO: ErrorCode 모은 후 401 INVALID_CREDENTIALS 등으로 수정
        }
        if (!passwordEncoder.matches(password, user.get().getPassword())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED); // TODO: ErrorCode 모은 후 401 INVALID_CREDENTIALS 등으로 수정
        }
        return user.get();
    }
}
