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
    // hasError를 src와 무관한 불리언으로 두면, 한 번 로드에 실패한 뒤 src가 새 값으로
    // 바뀌어도(예: 프로필 사진 재업로드) 계속 깨진 상태로 고정되는 문제가 있었습니다.
    // 그 대신 "어떤 src에서 에러가 났었는지"를 기억해서, 현재 src와 다르면 자동으로
    // 초기화된 것처럼 동작하도록 만듭니다 (별도 useEffect 없이 렌더링 중 계산).
    const [erroredSrc, setErroredSrc] = React.useState<string | null>(null);
    const hasError = src !== undefined && src === erroredSrc;
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
            onError={() => setErroredSrc(src ?? null)}
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";
