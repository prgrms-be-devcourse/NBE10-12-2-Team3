package com.scommit.domain.user.usermedia.repository;

import com.scommit.domain.user.user.entity.User;
import com.scommit.domain.user.usermedia.entity.UserMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserMediaRepository extends JpaRepository<UserMedia, Long> {
    Optional<UserMedia> findByUser(User user);
}
