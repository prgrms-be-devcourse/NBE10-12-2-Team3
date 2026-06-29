package com.scommit.domain.subscription.repository;

import com.scommit.domain.subscription.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    // 1. 팔로우 중복 검증용: 특정 유저가 특정 창작자를 이미 구독중인지 확인
    boolean existsByUser_IdAndCreator_Id(Long userId, Long creatorId);

    // 2. 언팔로우용: 특정 유저와 창작자의 구독 정보 엔티티 조회 (단건)
    Optional<Subscription> findByUser_IdAndCreator_Id(Long userId, Long creatorId);
}
