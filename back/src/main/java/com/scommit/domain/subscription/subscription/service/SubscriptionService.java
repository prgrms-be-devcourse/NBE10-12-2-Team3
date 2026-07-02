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
import com.scommit.domain.subscription.subscription.service.dto.SubscriptionInfo;

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

        Subscription subscription = subscriptionRepository.findByUserIdAndCreatorId(userId, creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND)); // "먼저 팔로우를 진행해주세요"

        if (subscription.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND); // "먼저 팔로우를 진행해주세요"
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

    public List<SubscriptionInfo> getMySubscriptions(Long userId) {
        List<Subscription> subscriptions = subscriptionRepository.findMySubscriptions(userId);
        return subscriptions.stream()
                .map(SubscriptionInfo::from)
                .toList();
    }
}
