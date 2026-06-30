"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeriesCardProps {
  id: number | string;
  title: string;
  body?: string;
  postCount?: number;
  authorName?: string;
  lastUpdatedAt: string;
  thumbnailUrl?: string;
  className?: string;
  href?: string;
  isOwner?: boolean; // 본인 여부 (본인이면 수정/삭제 메뉴 노출)
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function SeriesCard({ 
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
}: SeriesCardProps) {
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
      // 백엔드 연동 전이므로 임시 알럿
      alert("삭제 API가 호출되었습니다. (백엔드 연동 대기중)");
    }
  };

  return (
    <Link
      href={href || `/series/${id}`}
      onClick={onClick}
      prefetch={false}
      className={cn(
        "group relative block h-full w-full rounded-[16px] shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 z-10",
        className
      )}
      onMouseLeave={() => setShowMenu(false)} // 마우스가 카드를 벗어나면 메뉴 닫기
    >
      {/* Stack Effect Background Layers */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 rounded-[16px] bg-neutral-300 border border-neutral-400/50 shadow-sm transition-all duration-300 origin-bottom-left group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:rotate-2" />
        <div className="absolute inset-0 rounded-[16px] bg-neutral-200 border border-neutral-300/60 shadow-sm transition-all duration-300 origin-bottom-left group-hover:translate-x-1.5 group-hover:-translate-y-1.5 group-hover:rotate-1" />
      </div>

      {/* Main Card Content */}
      <div className="relative flex flex-col h-full w-full bg-white rounded-[16px] border border-neutral-200/60 overflow-hidden z-20">
        
        {/* 카드 상단: 썸네일 영역 */}
        <div className="relative aspect-video w-full bg-neutral-900 border-b border-neutral-100 z-10">
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src={thumbnailUrl || "/images/default_series.jpg"} 
              alt={title} 
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
        <div className="flex flex-col flex-1 p-5 rounded-b-[16px] bg-white z-10 relative">
          
          {/* 우측 상단 Kebab 메뉴 (isOwner가 true일 때만 노출) */}
          {isOwner && (
            <div className="absolute top-3 right-3 z-30">
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

          <h3 className={`text-[15px] font-bold text-neutral-dark line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-2 ${isOwner ? 'pr-12' : ''}`}>
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
