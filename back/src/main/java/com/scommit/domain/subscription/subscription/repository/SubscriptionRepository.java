package com.scommit.domain.subscription.subscription.repository;

import com.scommit.domain.subscription.subscription.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    // 1. 팔로우 중복 검증용: 특정 유저가 특정 창작자를 이미 구독중인지 확인
    boolean existsByUserIdAndCreatorId(Long userId, Long creatorId);

    // 2. 언팔로우용: 특정 유저와 창작자의 구독 정보 엔티티 조회 (단건)
    Optional<Subscription> findByUserIdAndCreatorId(Long userId, Long creatorId);

    // 3. 내 구독/멤버십 목록 조회용 (N+1 방지를 위해 creator 패치 조인)
    @org.springframework.data.jpa.repository.Query("SELECT s FROM Subscription s JOIN FETCH s.creator WHERE s.user.id = :userId AND s.deletedAt IS NULL ORDER BY s.id DESC")
    java.util.List<Subscription> findMySubscriptions(@org.springframework.data.repository.query.Param("userId") Long userId);
}
