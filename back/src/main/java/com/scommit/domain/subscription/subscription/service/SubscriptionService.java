package com.scommit.domain.subscription.subscription.service;

import com.scommit.domain.subscription.subscription.entity.Subscription;
import com.scommit.domain.subscription.subscription.entity.SubscriptionTier;
import com.scommit.domain.subscription.subscription.repository.SubscriptionRepository;
import com.scommit.domain.user.user.entity.User;
import com.scommit.domain.user.user.repository.UserRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.scommit.domain.subscription.subscription.dto.SubscriptionInfo;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @Transactional
    public void follow(Long userId, Long creatorId) {
        if (userId.equals(creatorId)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
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
    }

    @Transactional
    public void unfollow(Long userId, Long creatorId) {
        Subscription subscription = subscriptionRepository.findByUserIdAndCreatorId(userId, creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND)); 

        if (subscription.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        if (subscription.getTier() == SubscriptionTier.MEMBERSHIP) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE); // "멤버십 해지를 먼저 진행해주세요"
        }

        subscription.softDelete();
    }

    @Transactional
    public void joinMembership(Long userId, Long creatorId) {
        if (userId.equals(creatorId)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
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
            return;
        }

        Subscription subscription = subscriptionOpt.get();

        if (subscription.getDeletedAt() != null) {
            // [NEW] 언팔로우(소프트 딜리트) 상태인 경우: 복구(자동 팔로우) 및 멤버십 승급
            subscription.restoreSubscription();
            subscription.upgradeToMembership();
            return;
        }

        if (subscription.getTier() == SubscriptionTier.MEMBERSHIP) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE); // "이미 멤버십에 가입되어 있습니다"
        }

        subscription.upgradeToMembership();
    }

    @Transactional
    public void cancelMembership(Long userId, Long creatorId) {
        Subscription subscription = subscriptionRepository.findByUserIdAndCreatorId(userId, creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (subscription.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        if (subscription.getTier() != SubscriptionTier.MEMBERSHIP) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE); // "멤버십 가입자가 아닙니다"
        }

        subscription.downgradeToFollow();
    }

    public Page<SubscriptionInfo> getMySubscriptions(Long userId, Pageable pageable) {
        Page<Subscription> subscriptionsPage = subscriptionRepository.findMySubscriptions(userId, pageable);
        return subscriptionsPage.map(SubscriptionInfo::from);
    }
}
