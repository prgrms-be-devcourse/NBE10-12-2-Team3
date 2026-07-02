package com.scommit.domain.subscription.subscription.controller;

import com.scommit.domain.subscription.subscription.dto.SubscriptionResponse;
import com.scommit.domain.subscription.subscription.dto.SubscriptionInfo;
import com.scommit.domain.subscription.subscription.service.SubscriptionService;
import com.scommit.global.dto.RsData;
import com.scommit.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import com.scommit.global.dto.PageResponse;

import java.util.List;

@Tag(name = "Subscription", description = "구독 및 멤버십 관련 API")
@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /**
     * API 1: 창작자 팔로우
     */
    @Operation(summary = "창작자 팔로우", description = "특정 창작자를 팔로우합니다.")
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
    @Operation(summary = "창작자 언팔로우", description = "팔로우 중인 창작자를 언팔로우합니다.")
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
    @Operation(summary = "멤버십 가입", description = "창작자의 멤버십에 가입합니다. (팔로우 자동 처리)")
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
    @Operation(summary = "멤버십 해지", description = "가입 중인 멤버십을 해지하고 팔로우 상태로 돌아갑니다.")
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
    @Operation(summary = "내 구독 목록 조회", description = "내가 팔로우 또는 멤버십 구독 중인 창작자 목록을 조회합니다.")
    @GetMapping
    public RsData<PageResponse<SubscriptionResponse>> getMySubscriptions(
            @AuthenticationPrincipal SecurityUser user,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<SubscriptionInfo> infoPage = subscriptionService.getMySubscriptions(user.getId(), pageable);
        
        Page<SubscriptionResponse> responsePage = infoPage.map(SubscriptionResponse::from);

        return new RsData<>("200-1", "내 구독 목록 조회 성공", new PageResponse<>(responsePage));
    }
}
