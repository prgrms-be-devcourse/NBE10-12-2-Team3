import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "free" | "membership" | "post" | "video";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "free", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // 공통 스타일
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-tight select-none border",
          {
            // 무료 뱃지: 연한 초록 배경 + 초록색 텍스트
            "bg-primary-tint text-primary border-primary/10": variant === "free",
            // 멤버십 뱃지: 연한 주황 배경 + 주황색 텍스트
            "bg-membership-tint text-membership border-membership/10": variant === "membership",
            // 일반 글 뱃지: 연한 회색 배경 + 어두운 회색 텍스트
            "bg-neutral-border/50 text-neutral-meta border-neutral-border": variant === "post" || variant === "video",
          },
          className
        )}
        {...props}
      >
        {children || (
          variant === "free" ? "무료" :
          variant === "membership" ? "멤버십" :
          variant === "post" ? "글" : "영상"
        )}
      </span>
    );
  }
);
Badge.displayName = "Badge";
