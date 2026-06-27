import React from "react";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeriesListCardProps {
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

export function SeriesListCard({ id, title, body, postCount, authorName, lastUpdatedAt, thumbnailUrl, className, href, onClick }: SeriesListCardProps) {
  return (
    <Link
      href={href || `/series/${id}`}
      onClick={onClick}
      className={cn(
        "group relative block w-full rounded-[16px] shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 z-10",
        className
      )}
    >
      {/* Stack Effect Background Layers (Hover-only Pop-out) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 rounded-[16px] bg-neutral-300 border border-neutral-400/50 shadow-sm transition-all duration-300 origin-bottom-left group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:rotate-1" />
        <div className="absolute inset-0 rounded-[16px] bg-neutral-200 border border-neutral-300/60 shadow-sm transition-all duration-300 origin-bottom-left group-hover:translate-x-1.5 group-hover:-translate-y-1.5 group-hover:rotate-[0.5deg]" />
      </div>

      {/* Main Card Content (White Background) */}
      <div className="relative flex flex-col sm:flex-row w-full bg-white rounded-[16px] border border-neutral-200/60 overflow-hidden group-hover:border-primary/20 transition-colors z-20">
        {/* 썸네일 영역 */}
        <div className="relative w-full sm:w-[200px] md:w-[240px] shrink-0 aspect-video sm:aspect-auto bg-neutral-900 border-b sm:border-b-0 sm:border-r border-neutral-100 z-10">
          <div className="absolute inset-0 overflow-hidden">
          <img 
            src={thumbnailUrl || "/images/default_series.jpg"} 
            alt="Series thumbnail" 
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        </div>
        
        <div className="absolute bottom-2 right-2 flex items-center z-20">
          <div className="flex items-center rounded-lg bg-neutral-800/50 backdrop-blur-md px-2.5 py-1 shadow-lg border border-white/10">
            <span className="text-[11px] font-bold text-white tracking-wide drop-shadow-sm">
              {postCount}개의 게시글
            </span>
          </div>
        </div>
      </div>

      {/* 내용 영역 */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 min-w-0 justify-center">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-400">
            <Calendar className="h-3 w-3" />
            {lastUpdatedAt}
          </span>
        </div>
        
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-lg font-bold text-neutral-dark truncate group-hover:text-primary transition-colors mb-2">
            {title}
          </h3>
          <p className="text-[14px] leading-relaxed text-neutral-500 line-clamp-2 mb-4">
            {body || "내용이 없습니다."}
          </p>
          
          <div className="flex items-center gap-3 text-[12px] font-medium text-neutral-400">
            <span className="font-bold text-neutral-600 truncate max-w-[120px]">
              {authorName || "알 수 없는 사용자"}
            </span>
            <span className="flex items-center gap-1">
            </span>
          </div>
        </div>
      </div>

      {/* 우측 빈 공간 채우기 (화살표 인디케이터) */}
      <div className="hidden sm:flex items-center justify-center pr-6 pl-2 text-neutral-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300">
        <ChevronRight className="h-6 w-6" />
      </div>
      </div>
    </Link>
  );
}
