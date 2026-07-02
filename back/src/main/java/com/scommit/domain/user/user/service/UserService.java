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

    @Transactional
    public void logout(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        user.resetRefreshToken();
    }

    @Transactional
    public void deleteUser(Long id, String password) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        user.resetRefreshToken();
        user.softDelete();
    }

    public Optional<User> getUser(Long id) {
        return userRepository.findByIdAndDeletedAtIsNull(id);
    }

    @Transactional
    public User updateUser(Long id, String nickname, String introduction) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (user.getNickname().equals(nickname)) {nickname = null;}
        if (nickname != null && userRepository.existsByNickname(nickname)) {throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);} // TODO: ErrorCode 모은 후 DUPLICATE_NICKNAME 등으로 수정
        user.update(nickname, introduction);
        return user;
    }

    @Transactional
    public void updatePassword(Long id, String oldPassword, String newPassword) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED); // TODO: INVALID_PASSWORD 등으로 수정
        }
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.updatePassword(encodedPassword);
        user.resetRefreshToken();
    }
}
