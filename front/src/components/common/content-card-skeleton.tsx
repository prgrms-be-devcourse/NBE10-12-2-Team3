import React from "react";
import { cn } from "@/lib/utils";

export function ContentCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        // The magical CSS delay: stays invisible (opacity 0) for 200ms, then fades in smoothly.
        // Prevents CLS since it takes up space in the DOM immediately.
        "animate-in fade-in duration-500 delay-200",
        "flex flex-col overflow-hidden rounded-[16px] bg-white border border-neutral-100 shadow-sm",
        className
      )}
      style={{ animationFillMode: "both" }} // Ensures it stays hidden during the 200ms delay
    >
      {/* Thumbnail Skeleton */}
      <div className="aspect-video w-full bg-neutral-100 animate-pulse" />

      {/* Content Area Skeleton */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Author & Price Tag Skeleton */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-neutral-100 animate-pulse" />
            <div className="h-3 w-16 rounded bg-neutral-100 animate-pulse" />
          </div>
          <div className="h-4 w-12 rounded bg-neutral-100 animate-pulse" />
        </div>

        {/* Title Skeleton */}
        <div className="mb-3 space-y-1.5">
          <div className="h-4 w-11/12 rounded bg-neutral-100 animate-pulse" />
          <div className="h-4 w-4/5 rounded bg-neutral-100 animate-pulse" />
        </div>

        {/* Description Skeleton */}
        <div className="mt-2 space-y-1.5">
          <div className="h-3 w-full rounded bg-neutral-50 animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-neutral-50 animate-pulse" />
        </div>

        {/* Footer Area Skeleton */}
        <div className="mt-5 flex items-center justify-between border-t border-neutral-50 pt-4">
          <div className="h-3 w-12 rounded bg-neutral-50 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-3 w-8 rounded bg-neutral-50 animate-pulse" />
            <div className="h-3 w-8 rounded bg-neutral-50 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
