import React from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeriesCardProps {
  id: number | string;
  title: string;
  body: string;
  postCount: number;
  authorName: string;
  lastUpdatedAt: string;
  thumbnailUrl?: string;
  className?: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function SeriesCard({ id, title, body, postCount, authorName, lastUpdatedAt, thumbnailUrl, className, href, onClick }: SeriesCardProps) {
  return (
    <Link
      href={href || `/series/${id}`}
      onClick={onClick}
      className={cn(
        "group relative block h-full w-full rounded-[16px] shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 z-10",
        className
      )}
    >
      {/* Stack Effect Background Layers (Hover-only Pop-out) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 rounded-[16px] bg-neutral-300 border border-neutral-400/50 shadow-sm transition-all duration-300 origin-bottom-left group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:rotate-2" />
        <div className="absolute inset-0 rounded-[16px] bg-neutral-200 border border-neutral-300/60 shadow-sm transition-all duration-300 origin-bottom-left group-hover:translate-x-1.5 group-hover:-translate-y-1.5 group-hover:rotate-1" />
      </div>

      {/* Main Card Content (White Background) */}
      <div className="relative flex flex-col h-full w-full bg-white rounded-[16px] border border-neutral-200/60 overflow-hidden z-20">
        {/* 카드 상단: 썸네일 영역 */}
        <div className="relative aspect-video w-full bg-neutral-900 border-b border-neutral-100 z-10">
          <div className="absolute inset-0 overflow-hidden">
          <img 
            src={thumbnailUrl || "/images/default_series.jpg"} 
            alt="Series thumbnail" 
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        </div>
        
        <div className="absolute bottom-3 right-3 flex items-center z-20">
          <div className="flex items-center rounded-[10px] bg-neutral-800/50 backdrop-blur-md px-3 py-1.5 shadow-lg border border-white/10">
            <span className="text-[12px] font-bold text-white tracking-wide drop-shadow-sm">
              {postCount}개의 게시글
            </span>
          </div>
        </div>
      </div>

      {/* 카드 본문: 타이포그래피 & 상세 정보 */}
      <div className="flex flex-col flex-1 p-5 rounded-b-[16px] bg-white z-10">
        <h3 className="text-[15px] font-bold text-neutral-dark line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-2">
          {title}
        </h3>
        <p className="text-[13px] leading-relaxed text-neutral-500 line-clamp-2 flex-1 mb-4">
          {body || "내용이 없습니다."}
        </p>

        {/* 하단 메타데이터 */}
        <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-[12px] font-bold text-neutral-700 truncate pr-2">
            by {authorName || "알 수 없는 사용자"}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 shrink-0">
            <Calendar className="h-3 w-3" />
            {lastUpdatedAt}
          </span>
        </div>
      </div>
      </div>
    </Link>
  );
}
