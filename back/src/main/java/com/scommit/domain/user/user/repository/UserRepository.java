package com.scommit.domain.user.user.repository;

import com.scommit.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);

    Optional<User> findByRefreshTokenAndDeletedAtIsNull(String refreshToken);

    Optional<User> findByEmailAndDeletedAtIsNull(String email);
}
