package com.scommit.domain.subscription.subscription.service.dto;

import com.scommit.domain.subscription.subscription.entity.SubscriptionTier;
import com.scommit.domain.subscription.subscription.entity.Subscription;
import java.time.LocalDate;

public record SubscriptionInfo(
        Long creatorId,
        String nickname,
        String profileImage,
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
