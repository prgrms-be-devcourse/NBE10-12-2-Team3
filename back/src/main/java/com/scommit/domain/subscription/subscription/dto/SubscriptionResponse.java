package com.scommit.domain.subscription.subscription.dto;

import com.scommit.domain.subscription.subscription.entity.SubscriptionTier;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class SubscriptionResponse {
    private Long creatorId;
    private String nickname;
    
    // 창작자의 프로필 이미지 입니다.
    private String creatorProfileImage;
    
    private SubscriptionTier tier;
    private LocalDate startedAt;
    private LocalDate expiredAt;

    public static SubscriptionResponse from(SubscriptionInfo info) {
        return SubscriptionResponse.builder()
                .creatorId(info.creatorId())
                .nickname(info.nickname())
                .creatorProfileImage(info.creatorProfileImage())
                .tier(info.tier())
                .startedAt(info.startedAt())
                .expiredAt(info.expiredAt())
                .build();
    }
}
