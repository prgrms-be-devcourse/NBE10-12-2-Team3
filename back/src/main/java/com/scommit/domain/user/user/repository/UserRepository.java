package com.scommit.domain.user.user.repository;

import com.scommit.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);

    Optional<User> findByRefreshTokenAndDeletedAtIsNull(String refreshToken);

    Optional<User> findByIdAndDeletedAtIsNull(Long id);
    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    // 닉네임 키워드 검색
    Page<User> findByNicknameContainingAndDeletedAtIsNull(String nickname, Pageable pageable);
}
