package com.scommit.domain.subscription.controller;

import com.scommit.domain.subscription.service.SubscriptionService;
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
}
