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

export function FollowButton({ creatorId, initialTier = "NONE", className }: FollowButtonProps) {
  const [tier, setTier] = useState<FollowTier>(initialTier);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn } = useAuth();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    e.preventDefault();

    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!creatorId) return;
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (tier === "NONE") {
        // FOLLOW 하기
        const res = await fetch(`/api/subscriptions/follow/${creatorId}`, { method: "POST" });
        if (res.ok) setTier("FOLLOW");
      } else if (tier === "FOLLOW") {
        // MEMBERSHIP 가입
        const res = await fetch(`/api/subscriptions/membership/${creatorId}`, { method: "POST" });
        if (res.ok) setTier("MEMBERSHIP");
      } else if (tier === "MEMBERSHIP") {
        // 언팔로우 (멤버십 해지 + 팔로우 해지가 동시에 되는지 확실치 않으므로 언팔로우 호출)
        const res = await fetch(`/api/subscriptions/follow/${creatorId}`, { method: "DELETE" });
        if (res.ok) setTier("NONE");
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
  );
}
