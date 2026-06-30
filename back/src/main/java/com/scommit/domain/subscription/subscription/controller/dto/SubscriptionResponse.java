package com.scommit.domain.subscription.subscription.controller.dto;

import com.scommit.domain.subscription.subscription.entity.SubscriptionTier;
import com.scommit.domain.subscription.subscription.service.dto.SubscriptionInfo;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class SubscriptionResponse {
    private Long creatorId;
    private String nickname;
    private String profileImage;
    private SubscriptionTier tier;
    private LocalDate startedAt;
    private LocalDate expiredAt;

    public static SubscriptionResponse from(SubscriptionInfo info) {
        return SubscriptionResponse.builder()
                .creatorId(info.creatorId())
                .nickname(info.nickname())
                .profileImage(info.profileImage())
                .tier(info.tier())
                .startedAt(info.startedAt())
                .expiredAt(info.expiredAt())
                .build();
    }
}
