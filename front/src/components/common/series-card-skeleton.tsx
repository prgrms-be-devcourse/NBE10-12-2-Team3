import React from "react";
import { cn } from "@/lib/utils";

export function SeriesCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-in fade-in duration-500 delay-200",
        "relative flex flex-col h-full w-full rounded-[16px] bg-white border border-neutral-200/60 shadow-sm overflow-hidden",
        className
      )}
      style={{ animationFillMode: "both" }}
    >
      {/* 카드 상단: 썸네일 영역 */}
      <div className="relative aspect-video w-full bg-neutral-100 animate-pulse border-b border-neutral-100" />

      {/* 카드 본문: 타이포그래피 & 상세 정보 */}
      <div className="flex flex-col flex-1 p-5 rounded-b-[16px]">
        {/* Title */}
        <div className="mb-2 space-y-1.5">
          <div className="h-4 w-11/12 rounded bg-neutral-100 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-neutral-100 animate-pulse" />
        </div>
        
        {/* Body */}
        <div className="mb-4 space-y-1.5 mt-2">
          <div className="h-3 w-full rounded bg-neutral-50 animate-pulse" />
          <div className="h-3 w-5/6 rounded bg-neutral-50 animate-pulse" />
        </div>

        {/* 하단 메타데이터 */}
        <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="h-3 w-20 rounded bg-neutral-50 animate-pulse" />
          <div className="h-3 w-16 rounded bg-neutral-50 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
