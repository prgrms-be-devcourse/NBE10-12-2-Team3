package com.scommit.domain.subscription.subscription.service.dto;

import com.scommit.domain.subscription.subscription.entity.SubscriptionTier;
import com.scommit.domain.subscription.subscription.entity.Subscription;
import java.time.LocalDate;

public record SubscriptionInfo(
        Long creatorId,
        String nickname,
        String creatorProfileImage, // 구독받은 사람(창작자)의 프로필 이미지
        SubscriptionTier tier,
        LocalDate startedAt,
        LocalDate expiredAt
) {
    public static SubscriptionInfo from(Subscription subscription) {
        return new SubscriptionInfo(
                subscription.getCreator().getId(),
                subscription.getCreator().getNickname(),
                subscription.getCreator().getProfileImage(),
                subscription.getTier(),
                subscription.getStartedAt(),
                subscription.getExpiredAt()
        );
    }
}
