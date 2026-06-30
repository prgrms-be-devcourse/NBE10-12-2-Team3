package com.scommit.domain.subscription.subscription.service;

import com.scommit.domain.subscription.subscription.entity.Subscription;
import com.scommit.domain.subscription.subscription.entity.SubscriptionTier;
import com.scommit.domain.subscription.subscription.repository.SubscriptionRepository;
import com.scommit.domain.subscription.subscription.service.dto.SubscriptionInfo;
import com.scommit.domain.user.entity.User;
import com.scommit.domain.user.entity.UserRole;
import com.scommit.domain.user.repository.UserRepository;
import com.scommit.global.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @InjectMocks
    private SubscriptionService subscriptionService;

    private User subscriber;
    private User creator;
    private Subscription followSubscription;

    @BeforeEach
    void setUp() {
        subscriber = User.builder()
                .email("sub@test.com")
                .nickname("Subscriber")
                .role(UserRole.USER)
                .build();
        ReflectionTestUtils.setField(subscriber, "id", 1L);

        creator = User.builder()
                .email("creator@test.com")
                .nickname("Creator")
                .role(UserRole.USER)
                .build();
        ReflectionTestUtils.setField(creator, "id", 2L);

        followSubscription = Subscription.builder()
                .user(subscriber)
                .creator(creator)
                .tier(SubscriptionTier.FOLLOW)
                .build();
        ReflectionTestUtils.setField(followSubscription, "id", 100L);
    }

    @Nested
    @DisplayName("API 1: 팔로우 테스트")
    class FollowTest {
        @Test
        @DisplayName("성공: 창작자를 처음 팔로우한다")
        void followSuccess() {
            // given
            given(userRepository.findById(1L)).willReturn(Optional.of(subscriber));
            given(userRepository.findById(2L)).willReturn(Optional.of(creator));
            given(subscriptionRepository.findByUserIdAndCreatorId(1L, 2L)).willReturn(Optional.empty());

            // when
            subscriptionService.follow(1L, 2L);

            // then
            verify(subscriptionRepository).save(any(Subscription.class));
        }

        @Test
        @DisplayName("실패: 자기 자신을 팔로우할 수 없다")
        void followSelfFail() {
            // when & then
            assertThatThrownBy(() -> subscriptionService.follow(1L, 1L))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(com.scommit.global.exception.ErrorCode.INVALID_INPUT_VALUE);
            verify(subscriptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("실패: 이미 구독 중이면 중복 팔로우할 수 없다")
        void followAlreadySubscribedFail() {
            // given
            given(userRepository.findById(1L)).willReturn(Optional.of(subscriber));
            given(userRepository.findById(2L)).willReturn(Optional.of(creator));
            given(subscriptionRepository.findByUserIdAndCreatorId(1L, 2L)).willReturn(Optional.of(followSubscription));

            // when & then
            assertThatThrownBy(() -> subscriptionService.follow(1L, 2L))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(com.scommit.global.exception.ErrorCode.ALREADY_SUBSCRIBED);
        }
    }

    @Nested
    @DisplayName("API 2: 언팔로우 테스트")
    class UnfollowTest {
        @Test
        @DisplayName("성공: 팔로우 상태에서 언팔로우 시 소프트 딜리트 처리된다")
        void unfollowSuccess() {
            // given
            given(subscriptionRepository.findByUserIdAndCreatorId(1L, 2L)).willReturn(Optional.of(followSubscription));

            // when
            subscriptionService.unfollow(1L, 2L);

            // then
            assertThat(followSubscription.getDeletedAt()).isNotNull();
        }

        @Test
        @DisplayName("실패: 멤버십 구독 중일 때는 직접 언팔로우할 수 없다")
        void unfollowMembershipFail() {
            // given
            followSubscription.upgradeToMembership();
            given(subscriptionRepository.findByUserIdAndCreatorId(1L, 2L)).willReturn(Optional.of(followSubscription));

            // when & then
            assertThatThrownBy(() -> subscriptionService.unfollow(1L, 2L))
                    .isInstanceOf(BusinessException.class)
                    .extracting("errorCode")
                    .isEqualTo(com.scommit.global.exception.ErrorCode.INVALID_INPUT_VALUE);
        }
    }

    @Nested
    @DisplayName("API 3, 4: 멤버십 가입/해지 테스트")
    class MembershipTest {
        @Test
        @DisplayName("성공: 멤버십 가입 시 Tier가 MEMBERSHIP으로 오르고 만료일이 설정된다")
        void joinMembershipSuccess() {
            // given
            given(subscriptionRepository.findByUserIdAndCreatorId(1L, 2L)).willReturn(Optional.of(followSubscription));

            // when
            subscriptionService.joinMembership(1L, 2L);

            // then
            assertThat(followSubscription.getTier()).isEqualTo(SubscriptionTier.MEMBERSHIP);
            assertThat(followSubscription.getExpiredAt()).isNotNull();
        }

        @Test
        @DisplayName("성공: 멤버십 해지 시 Tier가 FOLLOW로 떨어지고 만료일이 지워진다")
        void cancelMembershipSuccess() {
            // given
            followSubscription.upgradeToMembership();
            given(subscriptionRepository.findByUserIdAndCreatorId(1L, 2L)).willReturn(Optional.of(followSubscription));

            // when
            subscriptionService.cancelMembership(1L, 2L);

            // then
            assertThat(followSubscription.getTier()).isEqualTo(SubscriptionTier.FOLLOW);
            assertThat(followSubscription.getExpiredAt()).isNull();
        }
    }

    @Nested
    @DisplayName("API 5: 구독 목록 조회 테스트")
    class GetMySubscriptionsTest {
        @Test
        @DisplayName("성공: 내 구독 목록을 조회하여 DTO로 반환한다")
        void getMySubscriptionsSuccess() {
            // given
            given(subscriptionRepository.findMySubscriptions(1L)).willReturn(List.of(followSubscription));

            // when
            List<SubscriptionInfo> infos = subscriptionService.getMySubscriptions(1L);

            // then
            assertThat(infos).hasSize(1);
            assertThat(infos.get(0).creatorId()).isEqualTo(2L);
            assertThat(infos.get(0).tier()).isEqualTo(SubscriptionTier.FOLLOW);
        }
    }
}
