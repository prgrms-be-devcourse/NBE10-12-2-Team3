package com.scommit.domain.subscription.subscription.controller;

import com.scommit.domain.subscription.subscription.controller.dto.SubscriptionResponse;
import com.scommit.domain.subscription.subscription.service.SubscriptionService;
import com.scommit.domain.subscription.subscription.service.dto.SubscriptionInfo;
import com.scommit.global.dto.RsData;
import com.scommit.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /**
     * API 1: 창작자 팔로우
     */
    @PostMapping("/follow/{creatorId}")
    public RsData<Void> follow(
            @PathVariable("creatorId") Long creatorId,
            @AuthenticationPrincipal SecurityUser user
    ) {
        subscriptionService.follow(user.getId(), creatorId);
        return new RsData<>("200-1", "팔로우 성공");
    }

    /**
     * API 2: 창작자 언팔로우
     */
    @DeleteMapping("/follow/{creatorId}")
    public RsData<Void> unfollow(
            @PathVariable("creatorId") Long creatorId,
            @AuthenticationPrincipal SecurityUser user
    ) {
        subscriptionService.unfollow(user.getId(), creatorId);
        return new RsData<>("200-1", "언팔로우 성공");
    }

    /**
     * API 3: 멤버십 가입
     */
    @PostMapping("/membership/{creatorId}")
    public RsData<Void> joinMembership(
            @PathVariable("creatorId") Long creatorId,
            @AuthenticationPrincipal SecurityUser user
    ) {
        subscriptionService.joinMembership(user.getId(), creatorId);
        return new RsData<>("200-1", "멤버십 가입 성공");
    }

    /**
     * API 4: 멤버십 해지
     */
    @DeleteMapping("/membership/{creatorId}")
    public RsData<Void> cancelMembership(
            @PathVariable("creatorId") Long creatorId,
            @AuthenticationPrincipal SecurityUser user
    ) {
        subscriptionService.cancelMembership(user.getId(), creatorId);
        return new RsData<>("200-1", "멤버십 해지 성공");
    }

    /**
     * API 5: 내 구독/멤버십 창작자 목록 조회
     */
    @GetMapping
    public RsData<List<SubscriptionResponse>> getMySubscriptions(
            @AuthenticationPrincipal SecurityUser user
    ) {
        List<SubscriptionInfo> infos = subscriptionService.getMySubscriptions(user.getId());
        
        List<SubscriptionResponse> responses = infos.stream()
                .map(SubscriptionResponse::from)
                .toList();

        return new RsData<>("200-1", "내 구독 목록 조회 성공", responses);
    }
}
