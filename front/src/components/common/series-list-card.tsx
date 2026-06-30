"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeriesListCardProps {
  id: number | string;
  title: string;
  body?: string;
  postCount?: number;
  authorName?: string;
  lastUpdatedAt: string;
  thumbnailUrl?: string;
  className?: string;
  href?: string;
  isOwner?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function SeriesListCard({ 
  id, 
  title, 
  body, 
  postCount = 0, 
  authorName, 
  lastUpdatedAt, 
  thumbnailUrl, 
  className, 
  href, 
  isOwner = false,
  onClick 
}: SeriesListCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  // Kebab 메뉴 클릭 시 Link 이동 방지
  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    router.push(`/series/${id}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    
    if (window.confirm("이 시리즈를 정말 삭제하시겠습니까?")) {
      // TODO: 실제 API 연동 (DELETE /api/series/{id})
      alert("삭제 API가 호출되었습니다. (백엔드 연동 대기중)");
    }
  };

  return (
    <Link
      href={href || `/series/${id}`}
      onClick={onClick}
      prefetch={false}
      className={cn(
        "group relative block w-full rounded-[16px] shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 z-10",
        className
      )}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Stack Effect Background Layers (Hover-only Pop-out) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 rounded-[16px] bg-neutral-300 border border-neutral-400/50 shadow-sm transition-all duration-300 origin-bottom-left group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:rotate-1" />
        <div className="absolute inset-0 rounded-[16px] bg-neutral-200 border border-neutral-300/60 shadow-sm transition-all duration-300 origin-bottom-left group-hover:translate-x-1.5 group-hover:-translate-y-1.5 group-hover:rotate-[0.5deg]" />
      </div>

      {/* Main Card Content (White Background) */}
      <div className="relative flex flex-col sm:flex-row w-full bg-white rounded-[16px] border border-neutral-200/60 overflow-visible sm:overflow-hidden group-hover:border-primary/20 transition-colors z-20">
      
        {/* 썸네일 영역 */}
        <div className="relative w-full sm:w-[320px] md:w-[400px] shrink-0 aspect-video sm:aspect-auto bg-neutral-900 border-b sm:border-b-0 sm:border-r border-neutral-100 z-10 overflow-hidden sm:rounded-l-[16px]">
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
        <div className="flex flex-col flex-1 p-5 sm:p-6 md:p-8 min-w-0 justify-center relative">
          
          {/* 우측 상단 Kebab 메뉴 (isOwner가 true일 때만 노출) */}
          {isOwner && (
            <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-30">
              <button 
                onClick={handleMenuClick}
                className="h-10 w-10 flex items-center justify-center rounded-full text-neutral-300 group-hover:text-neutral-500 hover:!text-neutral-800 hover:bg-neutral-100 transition-colors"
                aria-label="관리 메뉴"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              
              {/* 드롭다운 메뉴 */}
              {showMenu && (
                <div className="absolute right-0 top-10 w-32 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-neutral-100 py-1 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary font-medium transition-colors text-left"
                  >
                    <Pencil className="h-4 w-4" /> 수정
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium transition-colors text-left"
                  >
                    <Trash2 className="h-4 w-4" /> 삭제
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="flex items-center gap-1 text-[12px] md:text-[13px] font-medium text-neutral-400">
              <Calendar className="h-4 w-4" />
              {lastUpdatedAt}
            </span>
          </div>
          
          <div className={`flex-1 min-w-0 mt-1 ${isOwner ? 'pr-14' : 'pr-4'}`}>
            <h3 className="text-xl md:text-2xl font-extrabold text-neutral-dark truncate group-hover:text-primary transition-colors mb-3">
              {title}
            </h3>
            <p className="text-sm md:text-base leading-relaxed text-neutral-500 line-clamp-2 md:line-clamp-3 mb-6">
              {body || "내용이 없습니다."}
            </p>
            
            <div className="flex items-center gap-3 text-[12px] font-medium text-neutral-400">
              <span className="font-bold text-neutral-600 truncate max-w-[120px]">
                {authorName || "알 수 없는 사용자"}
              </span>
            </div>
          </div>
        </div>

        {/* 우측 빈 공간 채우기 (화살표 인디케이터) */}
        <div className="hidden sm:flex items-center justify-center pr-8 pl-4 text-neutral-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300">
          <ChevronRight className="h-8 w-8" />
        </div>
      </div>
    </Link>
  );
}
