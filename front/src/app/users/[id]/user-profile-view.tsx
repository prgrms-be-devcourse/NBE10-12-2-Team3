"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tab, type TabItem } from "@/components/ui/tab";
import { ContentCard } from "@/components/common/content-card";
import { SeriesListRow } from "@/components/common/series-list-row";
import { ConfirmModal } from "@/components/common/confirm-modal";
import { useAuth } from "@/providers/auth-provider";
import { apiPost, apiDelete } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { UserProfileResponse, PostListResponse, SeriesListResponse } from "./page";

// page.tsx의 UserProfileResponse를 그대로 재사용해서, API 응답 형태가 바뀌면
// 컴파일 타임에 바로 잡히도록 합니다. 이 파일에서 별도 Profile 타입을 정의하지 않습니다.
type Profile = UserProfileResponse;
type PostItem = PostListResponse;
type SeriesItem = SeriesListResponse;

interface UserProfileViewProps {
  profile: Profile;
  tab: "post" | "series";
  // 시리즈 탭 전용: 번호식 페이지네이션 기준 페이지
  page: number;
  // 시리즈 탭 전용: 번호식 페이지네이션 총 페이지 수
  totalPages: number;
  // 포스트 탭 전용: Slice 응답의 last 필드. true면 다음 페이지가 없음
  isLastPostsPage: boolean;
  posts: PostItem[];
  series: SeriesItem[];
}

const TABS: TabItem[] = [
  { id: "post", label: "포스트" },
  { id: "series", label: "시리즈" },
];

export function UserProfileView({ profile, tab, page, totalPages, isLastPostsPage, posts, series }: UserProfileViewProps) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  // TODO: 로그인한 사용자의 초기 isFollowing/isMember 상태는 프로필 응답(UserProfileResponse)에 없습니다.
  // GET /api/subscriptions(내 구독 목록, tier: FOLLOW|MEMBERSHIP)에서 creatorId가 일치하는 항목이
  // 있는지로 판단 가능하나, 페이지네이션된 목록을 직접 뒤져야 해서 비효율적입니다.
  // 더 나은 방법(예: 프로필 응답에 isFollowing 필드 추가)을 백엔드에 요청하는 것을 고려하세요.
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isFollowSubmitting, setIsFollowSubmitting] = useState(false);
  const [isMembershipSubmitting, setIsMembershipSubmitting] = useState(false);

  // useAuth().user.id(number)와 프로필 id를 비교해 본인 프로필 여부를 판단합니다.
  const isOwnProfile = isLoggedIn && user?.id === profile.id;

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // 응답은 RsData<Void>. 인증은 이 프로젝트의 기존 클라이언트 패턴(apiPost/apiDelete → credentials:'include'
  // 쿠키 기반)을 그대로 따릅니다. 실패 시 최소한의 alert로 알리고 버튼 상태는 성공했을 때만 갱신합니다.
  const handleFollow = async () => {
    if (isFollowSubmitting) return;
    setIsFollowSubmitting(true);
    try {
      if (isFollowing) {
        await apiDelete(`/api/subscriptions/follow/${profile.id}`);
      } else {
        await apiPost(`/api/subscriptions/follow/${profile.id}`);
      }
      setIsFollowing((prev) => !prev);
    } catch {
      alert(isFollowing ? "언팔로우에 실패했습니다." : "팔로우에 실패했습니다.");
    } finally {
      setIsFollowSubmitting(false);
    }
  };

  // 가입: POST /api/subscriptions/membership/{creatorId} (가입 시 팔로우 자동 처리됨)
  // 해지: DELETE /api/subscriptions/membership/{creatorId} (해지 시 팔로우 상태로 돌아감)
  const handleMembership = async () => {
    if (isMembershipSubmitting) return;
    setIsMembershipSubmitting(true);
    try {
      if (isMember) {
        await apiDelete(`/api/subscriptions/membership/${profile.id}`);
      } else {
        await apiPost(`/api/subscriptions/membership/${profile.id}`);
      }
      setIsMember((prev) => !prev);
    } catch {
      alert(isMember ? "멤버십 해지에 실패했습니다." : "멤버십 가입에 실패했습니다.");
    } finally {
      setIsMembershipSubmitting(false);
    }
  };

  const handleFollowClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    handleFollow();
  };

  const handleMembershipClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    handleMembership();
  };

  // ConfirmModal의 useEffect가 onCancel을 deps로 사용하므로, 매 렌더마다 새 함수를
  // 넘기지 않도록 참조를 고정합니다.
  const closeLoginModal = useCallback(() => setShowLoginModal(false), []);

  const handleTabChange = (newTab: string) => {
    router.push(`/users/${profile.id}?tab=${newTab}&page=1`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/users/${profile.id}?tab=${tab}&page=${newPage}`);
  };

  const stats: { label: string; value: string }[] = [
    { label: "포스트", value: profile.postCount.toLocaleString("ko-KR") },
    { label: "구독자", value: profile.subscriberCount.toLocaleString("ko-KR") },
    { label: "구독 중", value: profile.subscribingCount.toLocaleString("ko-KR") },
  ];

  // 시리즈 탭: Page 응답(totalPages/isLast 보유) 기반 번호식 페이지네이션
  const renderSeriesPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="mt-12 flex justify-center">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outlined"
            aria-label="이전 페이지"
            className={cn("h-10 w-10 rounded-full p-0 flex items-center justify-center transition-all", page <= 1 ? "border-transparent bg-neutral-50 text-neutral-300" : "border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800")}
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - page) <= 1) {
              return (
                <Button
                  key={pageNum}
                  variant="outlined"
                  className={cn("h-10 w-10 rounded-full p-0 font-bold transition-all", page === pageNum ? "border-primary text-primary bg-primary/5 shadow-sm" : "border-transparent text-neutral-600 hover:bg-neutral-100")}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            }
            if (pageNum === 2 && page > 3) return <span key={pageNum} className="px-1.5 text-neutral-400 flex items-center justify-center h-10">...</span>;
            if (pageNum === totalPages - 1 && page < totalPages - 2) return <span key={pageNum} className="px-1.5 text-neutral-400 flex items-center justify-center h-10">...</span>;
            return null;
          })}

          <Button
            variant="outlined"
            aria-label="다음 페이지"
            className={cn("h-10 w-10 rounded-full p-0 flex items-center justify-center transition-all", page >= totalPages ? "border-transparent bg-neutral-50 text-neutral-300" : "border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800")}
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  };

  // 포스트 탭: Slice 응답이라 totalPages/totalElements가 없음 → "이전/다음" 버튼만 노출.
  // "다음"은 last === true일 때 비활성화하고, "이전"은 프론트가 직접 추적하는 page 번호로 판단합니다.
  const renderPostPagination = () => {
    if (page <= 1 && isLastPostsPage) return null;

    return (
      <div className="mt-12 flex justify-center">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outlined"
            aria-label="이전 페이지"
            className={cn("h-10 w-10 rounded-full p-0 flex items-center justify-center transition-all", page <= 1 ? "border-transparent bg-neutral-50 text-neutral-300" : "border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800")}
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outlined"
            aria-label="다음 페이지"
            className={cn("h-10 w-10 rounded-full p-0 flex items-center justify-center transition-all", isLastPostsPage ? "border-transparent bg-neutral-50 text-neutral-300" : "border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800")}
            disabled={isLastPostsPage}
            onClick={() => handlePageChange(page + 1)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 프로필 사진 + 닉네임: 배너 경계가 아바타(xl, 96px) 세로 길이의 45% 지점을 가로지르도록 배치.
            겹침 비율은 이 margin-top 값(아바타 높이의 45%)으로만 결정됩니다 — 배너 높이(page.tsx의 h-40 sm:h-48)는
            겹침 비율에 영향을 주지 않습니다. */}
        <div className="flex flex-wrap items-end justify-between gap-4 -mt-[43.2px] relative z-10">
          <div className="flex items-end gap-4">
            <Avatar
              src={profile.profileImageUrl}
              name={profile.nickname}
              size="xl"
              className="border-4 border-white shadow-lg bg-white shrink-0"
            />
            <div className="pb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-dark">{profile.nickname}</h1>
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex items-end gap-2 pb-2">
              <Button size="sm" variant="outlined" className="rounded-full px-6" onClick={handleFollowClick} disabled={isFollowSubmitting}>
                {isFollowing ? "팔로잉" : "팔로우"}
              </Button>
              {profile.offersMembership && (
                <Button
                  size="sm"
                  variant="filled"
                  className="rounded-full px-6 bg-membership text-white hover:bg-membership/90 active:bg-membership/90"
                  onClick={handleMembershipClick}
                  disabled={isMembershipSubmitting}
                >
                  {isMember ? "멤버십 해지" : "멤버십"}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 자기소개 */}
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
          {profile.introduction || "작성한 소개글이 없습니다."}
        </p>

        {/* 통계 */}
        <div className="mt-6 flex flex-wrap gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-baseline gap-1.5 rounded-xl border border-neutral-border bg-white px-4 py-2.5 shadow-sm"
            >
              <span className="text-base font-extrabold text-neutral-dark">{stat.value}</span>
              <span className="text-sm font-medium text-neutral-meta">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* 구분선 */}
        <div className="mt-8 border-t border-neutral-border" />

        {/* 탭 */}
        <div className="mt-6">
          <Tab tabs={TABS} activeTabId={tab} onChange={handleTabChange} />
        </div>

        {/* 포스트 / 시리즈 목록 */}
        <div className="mt-8 min-h-[300px]">
          {tab === "post" ? (
            posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-24 text-center">
                <p className="text-neutral-500">아직 작성한 포스트가 없습니다.</p>
              </div>
            ) : (
              // TODO: 썸네일 API 미제공 — PostListResponse에 thumbnailUrl 필드가 없어 ContentCard가 기본 썸네일로 대체합니다.
              // TODO: 포스트 설명은 PostListResponse에 없어 ContentCard에 전달하지 않습니다
              // (description은 optional이라 비워두면 빈 값으로 렌더링됩니다).
              // authorName은 이 페이지의 포스트가 모두 profile(조회 중인 유저)의 글이므로 profile.nickname을 그대로 사용합니다.
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {posts.map((post) => (
                  <ContentCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    accessLevel={post.accessLevel}
                    authorName={profile.nickname}
                    createdAt={post.createdAt.split("T")[0]}
                    viewCount={post.viewCount}
                  />
                ))}
              </div>
            )
          ) : series.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-24 text-center">
              <p className="text-neutral-500">아직 작성한 시리즈가 없습니다.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {series.map((s) => (
                <SeriesListRow
                  key={s.id}
                  id={s.id}
                  title={s.title}
                  description={s.body}
                  // TODO: [백엔드 확인 필요] SeriesListResponse에 공개/멤버십 필드가 추가되면 교체
                  accessLevel="PUBLIC"
                  updatedAt={s.updatedAt.split("T")[0]}
                  postCount={s.postCount}
                  thumbnailUrl={s.thumbnailUrl}
                  isOwner={isOwnProfile}
                />
              ))}
            </div>
          )}

          {tab === "post" ? renderPostPagination() : renderSeriesPagination()}
        </div>
      </div>

      {showLoginModal && (
        <ConfirmModal
          title="로그인이 필요합니다"
          description="팔로우 및 멤버십 기능은 로그인 후 이용할 수 있어요."
          onConfirm={() => {
            closeLoginModal();
            // TODO: /login 페이지 완성되면 아래 리다이렉트를 활성화하세요.
            // router.push("/login");
          }}
          onCancel={closeLoginModal}
        />
      )}
    </>
  );
}
