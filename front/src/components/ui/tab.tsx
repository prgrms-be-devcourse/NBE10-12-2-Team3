"use client";

import * as React from "react";
import { motion, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
}

export interface TabProps {
  tabs: TabItem[];
  activeTabId: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pill";
  className?: string;
}

export const Tab = React.forwardRef<HTMLDivElement, TabProps>(
  ({ className, tabs, activeTabId, onChange, variant = "underline", ...props }, ref) => {
    // 각각의 탭 그룹별로 애니메이션이 꼬이지 않도록 고유 ID 부여
    const layoutId = React.useId();

    return (
      <LayoutGroup id={layoutId}>
        <div
          ref={ref}
          className={cn(
            "flex items-center select-none",
            {
              // Underline Variant: GNB/프로필 탭
              "border-b border-neutral-border w-full gap-8": variant === "underline",
              // Pill Variant: 둥근 캡슐 칩 탭
              "gap-2 p-1 bg-neutral-border/30 rounded-full w-fit": variant === "pill",
            },
            className
          )}
          {...props}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                  "relative font-medium tracking-tight cursor-pointer transition-colors duration-200 focus:outline-none z-10",
                  // Underline Styles
                  {
                    "pb-3 text-base text-neutral-meta hover:text-neutral-dark": variant === "underline" && !isActive,
                    "pb-3 text-base text-primary font-semibold": variant === "underline" && isActive,
                    
                    // Pill Styles
                    "px-4 py-1.5 text-sm text-neutral-meta hover:text-neutral-dark rounded-full": variant === "pill" && !isActive,
                    "px-4 py-1.5 text-sm text-white font-semibold rounded-full": variant === "pill" && isActive,
                  }
                )}
              >
                {tab.label}
                
                {/* Underline Variant: 활성화 슬라이딩 바 */}
                {variant === "underline" && isActive && (
                  <motion.span
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Pill Variant: 활성화 백그라운드 슬라이딩 캡슐 */}
                {variant === "pill" && isActive && (
                  <motion.span
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-primary rounded-full -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    );
  }
);
Tab.displayName = "Tab";

