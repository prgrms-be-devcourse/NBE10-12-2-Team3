import React from "react";
import { cn } from "@/lib/utils";

export function CreatorCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-in fade-in duration-500 delay-200",
        "relative flex flex-col min-h-[260px] rounded-[16px] bg-white border border-neutral-200/60 shadow-sm overflow-hidden",
        className
      )}
      style={{ animationFillMode: "both" }}
    >
      {/* Card Header: Avatar & Meta */}
      <div className="pt-8 pb-2 flex flex-col items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-neutral-100 animate-pulse border-2 border-white shadow-md" />
        <div className="flex flex-col items-center gap-1 px-2 w-full">
          <div className="h-5 w-24 rounded bg-neutral-100 animate-pulse mx-auto" />
          <div className="flex items-center gap-1 mt-1">
            <div className="h-3 w-16 rounded bg-neutral-100 animate-pulse mx-auto" />
          </div>
        </div>
      </div>
      
      {/* Card Body: Introduction */}
      <div className="px-5 pb-4 flex-1 flex flex-col items-center justify-center gap-1.5 w-full">
        <div className="h-3 w-4/5 rounded bg-neutral-50 animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-neutral-50 animate-pulse" />
      </div>
      
      {/* Card Footer: Follow Button */}
      <div className="px-5 pb-5 mt-auto flex justify-center w-full">
        <div className="h-9 w-28 rounded-full bg-neutral-100 animate-pulse" />
      </div>
    </div>
  );
}
