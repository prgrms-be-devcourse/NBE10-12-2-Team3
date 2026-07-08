import React from "react";

// ProfileHeader와 동일한 레이아웃 크기를 사용해 로딩 완료 후 실제 콘텐츠로 바뀔 때
// 레이아웃이 튀지 않도록(CLS 방지) 맞춰뒀습니다.
export function ProfileHeaderSkeleton() {
  return (
    <div className="w-full bg-white border border-neutral-200/60 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
      {/* Left: User Info */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        <div className="h-24 w-24 rounded-full border-4 border-white shadow-md bg-neutral-100 animate-pulse" />

        <div className="flex flex-col items-center md:items-start gap-2 pt-2">
          <div className="h-7 w-40 rounded bg-neutral-100 animate-pulse" />
          <div className="h-4 w-32 rounded bg-neutral-100 animate-pulse" />
        </div>
      </div>

      {/* Right: Stats */}
      <div className="relative z-10 flex items-center h-full pt-4 md:pt-0">
        <div className="flex flex-col items-center justify-center gap-2 px-8 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl">
          <div className="h-4 w-20 rounded bg-neutral-100 animate-pulse" />
          <div className="h-8 w-12 rounded bg-neutral-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
