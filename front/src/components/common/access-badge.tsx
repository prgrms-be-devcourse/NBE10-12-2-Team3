import React from "react";
import { Crown } from "lucide-react";

interface AccessBadgeProps {
  accessLevel: "FREE" | "PAID";
}

export function AccessBadge({ accessLevel }: AccessBadgeProps) {
  if (accessLevel === "PAID") {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-black/85 px-3 py-1.5 backdrop-blur-md border border-white/40 shadow-lg shadow-black/40">
        <Crown className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-xs font-bold text-white">멤버십 전용</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 backdrop-blur-md border border-black/20 shadow-lg shadow-black/20">
      <span className="text-xs font-bold text-primary">전체 공개</span>
    </div>
  );
}
