import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon, ...props }, ref) => {
    return (
      <div className="relative w-full flex items-center">
        {icon && (
          <div className="absolute left-4 text-neutral-meta flex items-center justify-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            // 기본 스타일 & 포커스 효과 (Toss/Commit 스타일)
            "w-full h-11 bg-neutral-border/40 border border-neutral-border text-neutral-dark rounded-full text-sm font-normal tracking-tight placeholder-neutral-meta/80 transition-all duration-200 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:pointer-events-none",
            {
              // 아이콘이 있을 경우 왼쪽 여백 조정
              "pl-11 pr-4": icon,
              "px-5": !icon,
            },
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
