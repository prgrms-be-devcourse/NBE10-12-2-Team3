import React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatorCardProps {
  id: number | string;
  nickname: string;
  subscriberCount: number;
  introduction?: string;
  className?: string;
  href?: string;
}

export function CreatorCard({ id, nickname, subscriberCount, introduction, className, href }: CreatorCardProps) {
  const formattedSubscribers = new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(subscriberCount);

  return (
    <div className={cn("relative flex flex-col min-h-[260px] rounded-[16px] bg-white border border-neutral-200/60 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden group", className)}>
      {/* 전체 영역을 덮는 Link (버튼 제외) */}
      <Link href={href || `/users/${id}`} className="absolute inset-0 z-0" aria-label={`${nickname} 프로필 보기`} />
      
      {/* Card Header: Avatar & Meta */}
      <div className="pt-8 pb-2 flex flex-col items-center gap-3 relative z-10 pointer-events-none">
        <Avatar name={nickname} className="h-16 w-16 border-2 border-white shadow-md group-hover:scale-105 transition-transform" />
        <div className="flex flex-col items-center gap-1 overflow-hidden px-2">
          <span className="text-base font-bold text-neutral-dark truncate group-hover:text-primary transition-colors text-center">{nickname}</span>
          <div className="flex items-center gap-1">
            <Crown className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-neutral-meta">{formattedSubscribers}명 구독 중</span>
          </div>
        </div>
      </div>
      
      {/* Card Body: Introduction */}
      <div className="px-5 pb-4 flex-1 flex items-center justify-center relative z-10 pointer-events-none">
        <p className="text-[13px] leading-relaxed text-neutral-500 line-clamp-3 text-center">
          {introduction || "작성한 소개글이 없습니다."}
        </p>
      </div>
      
      {/* Card Footer: Follow Button */}
      <div className="px-5 pb-5 mt-auto relative z-10 flex justify-center">
        <button className="px-10 py-2 rounded-full bg-white border border-neutral-200 text-primary text-[13px] font-bold hover:bg-primary/5 hover:border-primary/30 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center cursor-pointer">
          팔로우
        </button>
      </div>
    </div>
  );
}
