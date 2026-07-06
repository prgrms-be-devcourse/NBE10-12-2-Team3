"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Check, Plus, Loader2 } from "lucide-react";
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
  const { isLoggedIn } = useAuth();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    try {
      // 🚨 [임시 테스트용] 백엔드 연동 없이 UI 전환만 시뮬레이션 합니다.
      await new Promise((resolve) => setTimeout(resolve, 400)); // 0.4초 통신 딜레이 흉내

      if (tier === "NONE") {
        setTier("FOLLOW");
      } else if (tier === "FOLLOW") {
        setTier("MEMBERSHIP");
      } else if (tier === "MEMBERSHIP") {
        setTier("FOLLOW"); // 멤버십 해지 시 일반 팔로우(FOLLOW)로 강등
      }
    } catch (error) {
      console.error("Subscription toggle failed", error);
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
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "relative flex items-center justify-center gap-1.5 px-6 py-2 rounded-full border text-[13px] font-bold transition-all duration-200 active:scale-[0.98] overflow-hidden min-w-[100px]",
        getStyle(),
        isLoading && "opacity-70 cursor-not-allowed",
        className,
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
  );
}
