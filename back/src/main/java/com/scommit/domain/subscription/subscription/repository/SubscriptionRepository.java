package com.scommit.domain.subscription.subscription.repository;

import com.scommit.domain.subscription.subscription.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    // 2. 언팔로우용: 특정 유저와 창작자의 구독 정보 엔티티 조회 (단건)
    Optional<Subscription> findByUserIdAndCreatorId(Long userId, Long creatorId);

    // 3. 내 구독/멤버십 목록 조회용 (N+1 방지를 위해 creator 패치 조인)
    @Query(value = "SELECT s FROM Subscription s JOIN FETCH s.creator WHERE s.user.id = :userId AND s.deletedAt IS NULL",
           countQuery = "SELECT count(s) FROM Subscription s WHERE s.user.id = :userId AND s.deletedAt IS NULL")
    Page<Subscription> findMySubscriptions(@Param("userId") Long userId, Pageable pageable);
}
