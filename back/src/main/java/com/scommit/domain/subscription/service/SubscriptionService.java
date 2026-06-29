package com.scommit.domain.subscription.service;

import com.scommit.domain.subscription.entity.Subscription;
import com.scommit.domain.subscription.entity.SubscriptionTier;
import com.scommit.domain.subscription.repository.SubscriptionRepository;
import com.scommit.domain.user.entity.User;
import com.scommit.domain.user.repository.UserRepository;
import com.scommit.global.exception.BusinessException;
import com.scommit.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @Transactional
    public void follow(Long userId, Long creatorId) {
        // 1. 자기 자신을 팔로우할 수 없음
        if (userId.equals(creatorId)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        }

        // 2. 유저(구독자)와 창작자 존재 여부 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 3. 기존 구독 기록 조회 (소프트 딜리트 처리된 이력 포함)
        Optional<Subscription> existingSubscriptionOpt = 
                subscriptionRepository.findByUser_IdAndCreator_Id(userId, creatorId);

        if (existingSubscriptionOpt.isPresent()) {
            Subscription existingSubscription = existingSubscriptionOpt.get();
            
            // 삭제되지 않고 활성화된 상태라면 예외 발생
            if (existingSubscription.getDeletedAt() == null) {
                throw new BusinessException(ErrorCode.ALREADY_SUBSCRIBED);
            }
            
            // 소프트 딜리트 상태라면 부활 (Resurrect)
            existingSubscription.resurrectFollow();
        } else {
            // 아예 기록이 없으면 새로 생성
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
        // 1. 활성화된 구독 상태 조회
        Subscription subscription = subscriptionRepository.findByUser_IdAndCreator_Id(userId, creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND)); // 에러 코드 확정 후 SUBSCRIPTION_NOT_FOUND 로 변경 권장

        // 2. 이미 지워진 상태인지 방어 코드
        if (subscription.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        // 3. 멤버십 가입자인 경우, 단순 언팔로우 불가 처리
        if (subscription.getTier() == SubscriptionTier.MEMBERSHIP) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE); // "멤버십 해지를 먼저 진행해주세요"
        }

        // 4. 언팔로우 처리 (소프트 딜리트)
        subscription.softDelete();
    }
}
