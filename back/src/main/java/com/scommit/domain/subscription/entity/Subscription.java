package com.scommit.domain.subscription.entity;

import com.scommit.domain.user.entity.User;
import com.scommit.global.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "subscriptions")
public class Subscription extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_tier", nullable = false)
    private SubscriptionTier tier;
    
    @Column(name = "started_at")
    private LocalDate startedAt;
    
    @Column(name = "expired_at")
    private LocalDate expiredAt;
    
    public enum SubscriptionTier{
      FOLLOW, MEMBERSHIP
    }
    
    @Builder
    public Subscription(User user, User creator, SubscriptionTier tier, LocalDate startedAt, LocalDate expiredAt) {
        this.user = user;
        this.creator = creator;
        this.tier = tier;
        this.startedAt = startedAt;
        this.expiredAt = expiredAt;
    }
}