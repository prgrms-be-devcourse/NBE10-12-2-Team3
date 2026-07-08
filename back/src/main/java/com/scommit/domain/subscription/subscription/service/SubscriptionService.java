package com.scommit.domain.subscription.subscription.service;

import com.scommit.domain.notification.notification.dto.NotificationResponse;
import com.scommit.domain.notification.notification.dto.NotificationType;
import com.scommit.domain.notification.notification.repository.SseEmitterRepository;
import com.scommit.domain.subscription.subscription.dto.SubscriptionInfo;
import com.scommit.domain.subscription.subscription.dto.SubscriptionStatus;
import com.scommit.domain.subscription.subscription.entity.Subscription;
import com.scommit.domain.subscription.subscription.entity.SubscriptionTier;
import com.scommit.domain.subscription.subscription.repository.SubscriptionRepository;
import com.scommit.domain.user.user.entity.User;
import com.scommit.domain.user.user.repository.UserRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.scommit.domain.subscription.subscription.dto.SubscriptionInfo;
import com.scommit.domain.subscription.subscription.dto.SubscriptionStatus;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final SseEmitterRepository sseEmitterRepository;

    @Transactional
    public void follow(Long userId, Long creatorId) {
        if (userId.equals(creatorId)) {
            throw new BusinessException(ErrorCode.SELF_SUBSCRIPTION_NOT_ALLOWED);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Optional<Subscription> existingSubscriptionOpt = 
                subscriptionRepository.findByUserIdAndCreatorId(userId, creatorId);

        if (existingSubscriptionOpt.isPresent()) {
            Subscription existingSubscription = existingSubscriptionOpt.get();
            
            if (existingSubscription.getDeletedAt() == null) {
                throw new BusinessException(ErrorCode.ALREADY_SUBSCRIBED);
            }
            
            existingSubscription.restoreSubscription();
        } else {
            Subscription newSubscription = Subscription.builder()
                    .user(user)
                    .creator(creator)
                    .tier(SubscriptionTier.FOLLOW)
                    .startedAt(LocalDate.now())
                    .build();

            subscriptionRepository.save(newSubscription);
        }

        sseEmitterRepository.sendToUser(creatorId, new NotificationResponse(
                NotificationType.FOLLOW,
                user.getNickname() + "님이 팔로우했습니다.",
                userId
        ));
    }

    @Transactional
    public void unfollow(Long userId, Long creatorId) {
        Subscription subscription = subscriptionRepository.findByUserIdAndCreatorId(userId, creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        if (subscription.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.SUBSCRIPTION_NOT_FOUND);
        }

        if (subscription.getTier() == SubscriptionTier.MEMBERSHIP) {
            throw new BusinessException(ErrorCode.MEMBERSHIP_ACTIVE_CANCEL_REQUIRED);
        }

        subscription.softDelete();
    }

    @Transactional
    public void joinMembership(Long userId, Long creatorId) {
        if (userId.equals(creatorId)) {
            throw new BusinessException(ErrorCode.SELF_SUBSCRIPTION_NOT_ALLOWED);
        }

        Optional<Subscription> subscriptionOpt = subscriptionRepository.findByUserIdAndCreatorId(userId, creatorId);

        if (subscriptionOpt.isEmpty()) {
            // [NEW] 팔로우 기록이 아예 없는 경우: 자동 팔로우(Subscription 생성) 및 멤버십 가입
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
            User creator = userRepository.findById(creatorId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

            Subscription newSubscription = Subscription.builder()
                    .user(user)
                    .creator(creator)
                    .tier(SubscriptionTier.MEMBERSHIP)
                    .startedAt(LocalDate.now())
                    .build();
            subscriptionRepository.save(newSubscription);
            sseEmitterRepository.sendToUser(creatorId, new NotificationResponse(
                    NotificationType.MEMBERSHIP,
                    user.getNickname() + "님이 멤버십에 가입했습니다.",
                    userId
            ));
            return;
        }

        Subscription subscription = subscriptionOpt.get();

        if (subscription.getDeletedAt() != null) {
            // [NEW] 언팔로우(소프트 딜리트) 상태인 경우: 복구(자동 팔로우) 및 멤버십 승급
            subscription.restoreSubscription();
            subscription.upgradeToMembership();
            sseEmitterRepository.sendToUser(creatorId, new NotificationResponse(
                    NotificationType.MEMBERSHIP,
                    subscription.getUser().getNickname() + "님이 멤버십에 가입했습니다.",
                    userId
            ));
            return;
        }

        if (subscription.getTier() == SubscriptionTier.MEMBERSHIP) {
            throw new BusinessException(ErrorCode.ALREADY_JOINED_MEMBERSHIP);
        }

        subscription.upgradeToMembership();
        sseEmitterRepository.sendToUser(creatorId, new NotificationResponse(
                NotificationType.MEMBERSHIP,
                subscription.getUser().getNickname() + "님이 멤버십에 가입했습니다.",
                userId
        ));
    }

    @Transactional
    public void cancelMembership(Long userId, Long creatorId) {
        Subscription subscription = subscriptionRepository.findByUserIdAndCreatorId(userId, creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        if (subscription.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.SUBSCRIPTION_NOT_FOUND);
        }

        if (subscription.getTier() != SubscriptionTier.MEMBERSHIP) {
            throw new BusinessException(ErrorCode.NOT_MEMBERSHIP_SUBSCRIBER);
        }

        subscription.downgradeToFollow();
    }

    public Page<SubscriptionInfo> getMySubscriptions(Long userId, Pageable pageable) {
        Page<Subscription> subscriptionsPage = subscriptionRepository.findMySubscriptions(userId, pageable);
        
        List<Long> creatorIds = subscriptionsPage.getContent().stream()
                .map(s -> s.getCreator().getId())
                .distinct()
                .collect(Collectors.toList());

        Map<Long, Long> followerCounts = creatorIds.isEmpty() ? Map.of() : 
                subscriptionRepository.countFollowersGroupedByCreatorIds(creatorIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        return subscriptionsPage.map(sub -> {
            Long count = followerCounts.getOrDefault(sub.getCreator().getId(), 0L);
            return SubscriptionInfo.from(sub, count);
        });
    }

    public long getMySubscriptionCount(Long userId) {
        return subscriptionRepository.countByUserIdAndDeletedAtIsNull(userId);
    }

    public SubscriptionStatus getSubscriptionStatus(Long userId, Long creatorId) {
        if (userId.equals(creatorId)) {
            return SubscriptionStatus.NONE;
        }
        Optional<Subscription> subscriptionOpt = subscriptionRepository.findByUserIdAndCreatorId(userId, creatorId);
        if (subscriptionOpt.isEmpty() || subscriptionOpt.get().getDeletedAt() != null) {
            return SubscriptionStatus.NONE;
        }
        return SubscriptionStatus.valueOf(subscriptionOpt.get().getTier().name());
    }

    @Transactional(readOnly = true)
    public long getFollowerCount(Long creatorId) {
        return subscriptionRepository.countByCreatorIdAndDeletedAtIsNull(creatorId);
    }
}
