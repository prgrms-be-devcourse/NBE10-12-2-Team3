"use client";

import { createPortal } from "react-dom";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Check, Plus, Loader2, Ban, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

export type FollowTier = "NONE" | "FOLLOW" | "MEMBERSHIP";

interface FollowButtonProps {
  creatorId?: string | number;
  initialTier?: FollowTier;
  className?: string;
}

export function FollowButton({
  creatorId,
  initialTier = "NONE",
  className,
}: FollowButtonProps) {
  const [tier, setTier] = useState<FollowTier>(initialTier);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modal states
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const { isLoggedIn } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMainClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isLoading) return;

    if (tier === "NONE") {
      // 미구독 상태: 즉시 팔로우
      await executeAction("FOLLOW");
    } else if (tier === "FOLLOW") {
      // 팔로우 상태: 드롭다운 토글
      setIsMenuOpen((prev) => !prev);
    } else if (tier === "MEMBERSHIP") {
      // 멤버십 상태: 멤버십 해지 모달 오픈
      setIsMenuOpen(false);
      setIsCancelModalOpen(true);
    }
  };

  const executeAction = async (action: "FOLLOW" | "UNFOLLOW" | "JOIN_MEMBERSHIP" | "CANCEL_MEMBERSHIP") => {
    setIsLoading(true);
    setIsMenuOpen(false);
    setIsJoinModalOpen(false);
    setIsCancelModalOpen(false);
    try {
      // 🚨 [임시 테스트용] 실제 API 대신 0.5초 통신 지연을 시뮬레이션 합니다.
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      /* 
       * 실제 연동 시 아래 코드로 변경하세요.
       * if (!isLoggedIn) { alert("로그인이 필요합니다."); return; }
       * 
       * switch(action) {
       *   case "FOLLOW": await fetch(`/api/subscriptions/follow/${creatorId}`, { method: "POST" }); break;
       *   case "UNFOLLOW": await fetch(`/api/subscriptions/follow/${creatorId}`, { method: "DELETE" }); break;
       *   case "JOIN_MEMBERSHIP": await fetch(`/api/subscriptions/membership/${creatorId}`, { method: "POST" }); break;
       *   case "CANCEL_MEMBERSHIP": await fetch(`/api/subscriptions/membership/${creatorId}`, { method: "DELETE" }); break;
       * }
       */
      
      switch (action) {
        case "FOLLOW": setTier("FOLLOW"); break;
        case "UNFOLLOW": setTier("NONE"); break;
        case "JOIN_MEMBERSHIP": setTier("MEMBERSHIP"); break;
        case "CANCEL_MEMBERSHIP": setTier("FOLLOW"); break;
      }
    } catch (error) {
      console.error("Action failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStyle = () => {
    switch (tier) {
      case "MEMBERSHIP":
        return "bg-membership hover:bg-membership/90 text-white shadow-md border-transparent";
      case "FOLLOW":
        return "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600";
      default:
        return "bg-white hover:bg-primary/5 border-primary/30 text-primary hover:border-primary/50 shadow-sm";
    }
  };

  return (
    <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={handleMainClick}
        disabled={isLoading}
        className={cn(
          "relative flex items-center justify-center gap-1.5 px-6 py-2 rounded-full border text-[13px] font-bold transition-all duration-200 active:scale-[0.98] overflow-hidden min-w-[100px]",
          getStyle(),
          isLoading && "opacity-70 cursor-not-allowed",
          className
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </motion.div>
          )}
          {!isLoading && tier === "MEMBERSHIP" && (
            <motion.div
              key="membership"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              <Star className="h-3.5 w-3.5 fill-white" />
              <span>멤버십</span>
            </motion.div>
          )}
          {!isLoading && tier === "FOLLOW" && (
            <motion.div
              key="follow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>팔로잉</span>
            </motion.div>
          )}
          {!isLoading && tier === "NONE" && (
            <motion.div
              key="none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>팔로우</span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown Menu for FOLLOW tier */}
      <AnimatePresence>
        {isMenuOpen && tier === "FOLLOW" && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 z-50 overflow-hidden"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Membership Modal */}
      <AnimatePresence>
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
      </AnimatePresence>

      {/* Cancel Membership Modal */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <ModalOverlay onClose={() => setIsCancelModalOpen(false)}>
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-center text-neutral-900 mb-2">멤버십을 해지하시겠습니까?</h3>
              <p className="text-center text-neutral-500 text-sm mb-6">
                해지 시 일반 팔로워로 전환되며, 현재 누리고 계신 모든 독점 혜택이 즉시 사라집니다. 그래도 진행하시겠습니까?
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsCancelModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  유지하기
                </button>
                <button
                  onClick={() => executeAction("CANCEL_MEMBERSHIP")}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-md"
                >
                  해지하기
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}

// 간단한 모달 배경 오버레이 컴포넌트
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  // 모달이 열려있을 때 바디 스크롤 방지 및 Portal 마운트 확인
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </motion.div>
    </motion.div>,
    document.body
  );
}
