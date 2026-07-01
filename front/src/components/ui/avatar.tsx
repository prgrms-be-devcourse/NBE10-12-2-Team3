"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const bgColorPresets = [
  "bg-sky-100 text-sky-700",
  "bg-pink-100 text-pink-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
];

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, name, size = "md", ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);
    const initial = name ? name.trim().charAt(0).toUpperCase() : "";

    // 유저 이니셜 문자열 코드를 기반으로 항상 동일한 파스텔 배경 선택
    const presetIndex = name ? name.charCodeAt(0) % bgColorPresets.length : 0;
    const bgClass = bgColorPresets[presetIndex];

    const sizeClasses = {
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-14 h-14 text-lg font-semibold",
      xl: "w-24 h-24 text-2xl font-bold",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full items-center justify-center font-medium select-none border border-neutral-border",
          sizeClasses[size],
          !src || hasError ? bgClass : "bg-neutral-border",
          className
        )}
        {...props}
      >
        {src && !hasError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";
