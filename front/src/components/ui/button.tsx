import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "outlined" | "ghost";
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "filled", size = "md", color = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // 공통 리셋 및 마이크로 액티브 피드백 (토스 모티브)
          "inline-flex items-center justify-center font-medium tracking-tight transition-all duration-200 ease-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          
          // 크기별 높이, 패딩, 폰트 조절
          {
            "h-9 px-3 text-sm rounded-lg": size === "sm",
            "h-11 px-5 text-base rounded-btn": size === "md",
            "h-14 px-8 text-lg rounded-xl": size === "lg",
          },
          
          // 스타일 조합
          {
            // Filled Primary: 초록색 브랜드 컬러
            "bg-primary text-white hover:bg-primary-hover active:bg-primary-active": variant === "filled" && color === "primary",
            // Filled Secondary: 부드러운 다크 그레이/연회색
            "bg-neutral-border text-neutral-dark hover:bg-neutral-meta/20 active:bg-neutral-meta/30": variant === "filled" && color === "secondary",
            
            // Outlined Primary: 초록색 테두리
            "border border-primary text-primary bg-transparent hover:bg-primary-tint active:bg-primary-tint/70": variant === "outlined" && color === "primary",
            // Outlined Secondary: 회색 테두리
            "border border-neutral-meta/30 text-neutral-dark bg-transparent hover:bg-neutral-border/40 active:bg-neutral-border/70": variant === "outlined" && color === "secondary",
            
            // Ghost
            "text-neutral-meta hover:text-neutral-dark hover:bg-neutral-border/50 active:bg-neutral-border/80": variant === "ghost",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
