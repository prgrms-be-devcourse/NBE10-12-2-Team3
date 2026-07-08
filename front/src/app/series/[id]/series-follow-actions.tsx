"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { UserPlus, Check, Star, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { apiFetch } from "@/lib/api";
import { ModalOverlay } from "@/components/common/modal-overlay";
import { CancelMembershipModal } from "@/components/common/cancel-membership-modal";
import type { FollowTier } from "@/components/common/follow-button";

interface SeriesFollowActionsProps {
  creatorId: number;
  nickname: string;
}

// mypage 구독 목록(FollowButton)과 동일한 팔로우/멤버십 동작(상태 조회, 즉시 팔로우,
// 팔로우 상태일 때 드롭다운, 멤버십 해지 확인)을 그대로 쓰되, 시리즈 상세 히어로의 원래
// "닉네임 + UserPlus 아이콘" 필 디자인은 유지합니다. FollowButton과 달리 라벨/아이콘을
// framer-motion으로 전환하지 않고 색상만 상태에 따라 바뀝니다.
export function SeriesFollowActions({ creatorId, nickname }: SeriesFollowActionsProps) {
  const { isLoggedIn, user } = useAuth();
  const hasMounted = useHasMounted();
  const [tier, setTier] = useState<FollowTier>("NONE");
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // hasMounted 가드: 서버는 로그인한 유저를 몰라 항상 비로그인으로 렌더링하므로,
  // 하이드레이션 이전엔 isLoggedIn을 그대로 쓰면 서버 HTML과 어긋납니다.
  const isOwnSeries = hasMounted && isLoggedIn && user?.id === creatorId;

  useEffect(() => {
    if (isLoggedIn && creatorId && !isOwnSeries) {
      apiFetch<{ status: FollowTier }>(`/api/subscriptions/status/${creatorId}`)
        .then((data) => setTier(data.status))
        .catch(console.error);
    }
  }, [isLoggedIn, creatorId, isOwnSeries]);

  // 드롭다운을 document.body에 포탈로 띄우기 때문에, 버튼과 드롭다운 둘 다의 바깥 클릭만
  // "바깥 클릭"으로 취급합니다.
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsMenuOpen(false);
    };
    // 히어로 영역이 overflow-hidden이라 드롭다운을 포탈로 띄우는데, 스크롤/리사이즈되면
    // 저장해둔 위치가 어긋나므로 그냥 닫습니다.
    const closeMenu = () => setIsMenuOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [isMenuOpen]);

  const executeAction = async (action: "FOLLOW" | "UNFOLLOW" | "JOIN_MEMBERSHIP" | "CANCEL_MEMBERSHIP") => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }
    setIsLoading(true);
    setIsMenuOpen(false);
    setIsJoinModalOpen(false);
    setIsCancelModalOpen(false);
    try {
      switch (action) {
        case "FOLLOW":
          await apiFetch(`/api/subscriptions/follow/${creatorId}`, { method: "POST" });
          break;
        case "UNFOLLOW":
          await apiFetch(`/api/subscriptions/follow/${creatorId}`, { method: "DELETE" });
          break;
        case "JOIN_MEMBERSHIP":
          await apiFetch(`/api/subscriptions/membership/${creatorId}`, { method: "POST" });
          break;
        case "CANCEL_MEMBERSHIP":
          await apiFetch(`/api/subscriptions/membership/${creatorId}`, { method: "DELETE" });
          break;
      }
      switch (action) {
        case "FOLLOW": setTier("FOLLOW"); break;
        case "UNFOLLOW": setTier("NONE"); break;
        case "JOIN_MEMBERSHIP": setTier("MEMBERSHIP"); break;
        case "CANCEL_MEMBERSHIP": setTier("FOLLOW"); break;
      }
    } catch (error) {
      console.error("Action failed", error);
      alert(error instanceof Error ? error.message : "요청에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMainClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLoading) return;

    if (tier === "NONE") {
      executeAction("FOLLOW");
    } else if (tier === "FOLLOW") {
      if (!isMenuOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setMenuPosition({ top: rect.bottom + 8, left: rect.left });
      }
      setIsMenuOpen((prev) => !prev);
    } else if (tier === "MEMBERSHIP") {
      setIsMenuOpen(false);
      setIsCancelModalOpen(true);
    }
  };

  if (isOwnSeries) {
    return (
      <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/5 shadow-sm">
        <span className="text-white font-bold">{nickname}</span>
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleMainClick}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-colors group",
          tier === "MEMBERSHIP" && "bg-membership hover:bg-membership/90 border-white/5 text-white",
          // mypage 구독 목록(FollowButton)의 팔로우 상태 색상을 그대로 가져옵니다.
          tier === "FOLLOW" && "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600",
          tier === "NONE" && "bg-white/10 hover:bg-white/20 border-white/5 text-white",
          isLoading && "opacity-70 cursor-not-allowed"
        )}
      >
        <span className="font-bold">{nickname}</span>
        {tier === "FOLLOW" ? (
          <Check className="h-3.5 w-3.5 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" />
        ) : (
          <UserPlus className="h-3.5 w-3.5 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" />
        )}
      </button>

      {isMenuOpen && tier === "FOLLOW" && menuPosition && hasMounted &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: menuPosition.top, left: menuPosition.left }}
            className="w-48 bg-white rounded-xl shadow-xl border border-neutral-100 z-50 overflow-hidden"
          >
            <div className="p-1 flex flex-col">
              <button
                onClick={() => { setIsMenuOpen(false); setIsJoinModalOpen(true); }}
                className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg hover:bg-neutral-50 transition-colors text-sm font-semibold text-neutral-800"
              >
                <div className="bg-yellow-100/50 p-1.5 rounded-md">
                  <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                </div>
                멤버십 가입
              </button>
              <div className="h-px bg-neutral-100 mx-2 my-1" />
              <button
                onClick={() => executeAction("UNFOLLOW")}
                className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold text-red-600"
              >
                <div className="bg-red-100/50 p-1.5 rounded-md">
                  <Ban className="h-4 w-4 text-red-600" />
                </div>
                팔로우 취소
              </button>
            </div>
          </div>,
          document.body
        )}

      {isJoinModalOpen && (
        <ModalOverlay onClose={() => setIsJoinModalOpen(false)}>
          <div className="p-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Star className="h-6 w-6 fill-primary" />
            </div>
            <h3 className="text-xl font-bold text-center text-neutral-900 mb-2">멤버십에 가입하시겠습니까?</h3>
            <p className="text-center text-neutral-500 text-sm mb-6">
              멤버십에 가입하면 창작자의 특별한 독점 콘텐츠와 혜택을 누릴 수 있습니다. 지금 바로 가입하고 창작자를 후원해보세요!
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => executeAction("JOIN_MEMBERSHIP")}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-md"
              >
                가입하기
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      <CancelMembershipModal
        open={isCancelModalOpen}
        onCancel={() => setIsCancelModalOpen(false)}
        onConfirm={() => executeAction("CANCEL_MEMBERSHIP")}
      />
    </div>
  );
}
