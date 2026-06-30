package com.scommit.domain.subscription.subscription.controller;

import com.scommit.domain.subscription.subscription.service.SubscriptionService;
import com.scommit.global.dto.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /**
     * API 1: 창작자 팔로우
     */
    @PostMapping("/follow/{creatorId}")
    public ResponseEntity<RsData<Void>> follow(
            @PathVariable("creatorId") Long creatorId,
            @RequestParam("tempUserId") Long tempUserId
    ) {
        subscriptionService.follow(tempUserId, creatorId);
        
        RsData<Void> rsData = new RsData<>("200-1", "팔로우 성공");
        return ResponseEntity.ok(rsData);
    }

    /**
     * API 2: 창작자 언팔로우
     */
    @DeleteMapping("/follow/{creatorId}")
    public ResponseEntity<RsData<Void>> unfollow(
            @PathVariable("creatorId") Long creatorId,
            @RequestParam("tempUserId") Long tempUserId
    ) {
        subscriptionService.unfollow(tempUserId, creatorId);
        
        RsData<Void> rsData = new RsData<>("200-1", "언팔로우 성공");
        return ResponseEntity.ok(rsData);
    }

    /**
     * API 3: 멤버십 가입
     */
    @PostMapping("/membership/{creatorId}")
    public ResponseEntity<RsData<Void>> joinMembership(
            @PathVariable("creatorId") Long creatorId,
            @RequestParam("tempUserId") Long tempUserId
    ) {
        subscriptionService.joinMembership(tempUserId, creatorId);
        
        RsData<Void> rsData = new RsData<>("200-1", "멤버십 가입 성공");
        return ResponseEntity.ok(rsData);
    }

    /**
     * API 4: 멤버십 해지
     */
    @DeleteMapping("/membership/{creatorId}")
    public ResponseEntity<RsData<Void>> cancelMembership(
            @PathVariable("creatorId") Long creatorId,
            @RequestParam("tempUserId") Long tempUserId
    ) {
        subscriptionService.cancelMembership(tempUserId, creatorId);
        
        RsData<Void> rsData = new RsData<>("200-1", "멤버십 해지 성공");
        return ResponseEntity.ok(rsData);
    }

    /**
     * API 5: 내 구독/멤버십 창작자 목록 조회
     */
    @GetMapping
    public ResponseEntity<RsData<java.util.List<com.scommit.domain.subscription.subscription.controller.dto.SubscriptionResponse>>> getMySubscriptions(
            @RequestParam("tempUserId") Long tempUserId
    ) {
        java.util.List<com.scommit.domain.subscription.subscription.service.dto.SubscriptionInfo> infos = 
                subscriptionService.getMySubscriptions(tempUserId);
        
        java.util.List<com.scommit.domain.subscription.subscription.controller.dto.SubscriptionResponse> responses = 
                infos.stream()
                .map(com.scommit.domain.subscription.subscription.controller.dto.SubscriptionResponse::from)
                .toList();

        RsData<java.util.List<com.scommit.domain.subscription.subscription.controller.dto.SubscriptionResponse>> rsData = 
                new RsData<>("200-1", "내 구독 목록 조회 성공", responses);
        return ResponseEntity.ok(rsData);
    }
}
