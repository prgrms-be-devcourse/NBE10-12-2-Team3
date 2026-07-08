package com.scommit.domain.subscription.subscription.repository;

import com.scommit.domain.subscription.subscription.entity.Subscription;
import com.scommit.domain.subscription.subscription.entity.SubscriptionTier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    // 2. 언팔로우용: 특정 유저와 창작자의 구독 정보 엔티티 조회 (단건)
    Optional<Subscription> findByUserIdAndCreatorId(Long userId, Long creatorId);

    // 3. 내 구독/멤버십 목록 조회용 (N+1 방지를 위해 creator 패치 조인)
    @Query(value = "SELECT s FROM Subscription s JOIN FETCH s.creator WHERE s.user.id = :userId AND s.deletedAt IS NULL",
           countQuery = "SELECT count(s) FROM Subscription s WHERE s.user.id = :userId AND s.deletedAt IS NULL")
    Page<Subscription> findMySubscriptions(@Param("userId") Long userId, Pageable pageable);

    // 4. 새 포스트 알림용: 창작자의 모든 구독자 조회 (다건)
    List<Subscription> findByCreatorIdAndDeletedAtIsNull(Long creatorId);

    // 5. 새 포스트 알림용: 창작자의 멤버십 구독자만 조회 (다건)
    List<Subscription> findByCreatorIdAndTierAndDeletedAtIsNull(Long creatorId, SubscriptionTier tier);

    // 6. N+1 방지용: 여러 창작자의 팔로워 수를 한 번에 조회
    @Query("SELECT s.creator.id, COUNT(s) FROM Subscription s WHERE s.creator.id IN :creatorIds AND s.deletedAt IS NULL GROUP BY s.creator.id")
    List<Object[]> countFollowersGroupedByCreatorIds(@Param("creatorIds") List<Long> creatorIds);

    // 7. 내 구독 총 개수 전용 API용
    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.user.id = :userId AND s.deletedAt IS NULL")
    long countByUserIdAndDeletedAtIsNull(@Param("userId") Long userId);
  
    // 8. 내 팔로워 수 통계 조회용
    long countByCreatorIdAndDeletedAtIsNull(Long creatorId);
}
