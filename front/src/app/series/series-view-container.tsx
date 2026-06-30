"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight, PenSquare, FolderOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SeriesCard } from "@/components/common/series-card";
import { SeriesListCard } from "@/components/common/series-list-card";
import { cn } from "@/lib/utils";

interface Series {
  id: number | string;
  title: string;
  body?: string;
  postCount?: number;
  authorName?: string;
  lastUpdatedAt: string;
  thumbnailUrl?: string;
}

interface SeriesViewContainerProps {
  seriesList: Series[];
  currentPage: number;
  totalPages: number;
}

export function SeriesViewContainer({ seriesList, currentPage, totalPages }: SeriesViewContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams?.get("sort") || "updatedAt,desc";
  
  // 뷰 모드 로컬 스토리지 연동 (검색 페이지와 동일한 "search_layout" 키 사용)
  const [layout, setLayout] = useState<"list" | "grid">("grid");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedLayout = localStorage.getItem("search_layout") as "list" | "grid";
    if (savedLayout) {
      setLayout(savedLayout);
    }
    setIsMounted(true);
  }, []);

  const handleLayoutChange = (newLayout: "list" | "grid") => {
    setLayout(newLayout);
    localStorage.setItem("search_layout", newLayout);
  };

  const handlePageChange = (newPage: number) => {
    // 쿼리 파라미터 유지하며 페이지 이동
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", newPage.toString());
    router.push(`/series?${params.toString()}`);
    
    // 페이지 이동 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 번호 페이지네이션 렌더링 로직
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="mt-12 flex justify-center">
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outlined" 
            className={cn("h-10 w-10 rounded-full p-0 flex items-center justify-center transition-all", currentPage <= 1 ? "border-transparent bg-neutral-50 text-neutral-300" : "border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800")} 
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1) {
              return (
                <Button 
                  key={pageNum}
                  variant="outlined" 
                  className={cn("h-10 w-10 rounded-full p-0 font-bold transition-all", currentPage === pageNum ? "border-primary text-primary bg-primary/5 shadow-sm" : "border-transparent text-neutral-600 hover:bg-neutral-100")}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            }
            if (pageNum === 2 && currentPage > 3) return <span key={pageNum} className="px-1.5 text-neutral-400 flex items-center justify-center h-10">...</span>;
            if (pageNum === totalPages - 1 && currentPage < totalPages - 2) return <span key={pageNum} className="px-1.5 text-neutral-400 flex items-center justify-center h-10">...</span>;
            return null;
          })}

          <Button 
            variant="outlined" 
            className={cn("h-10 w-10 rounded-full p-0 flex items-center justify-center transition-all", currentPage >= totalPages ? "border-transparent bg-neutral-50 text-neutral-300" : "border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800")} 
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  };

  // 클라이언트 마운트 전에는 레이아웃 시프트를 막기 위해 렌더링 대기
  if (!isMounted) {
    return <div className="min-h-[500px]" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-20">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200 sticky top-0 bg-neutral-50/90 backdrop-blur-md z-30 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-6">
          <Link
            href="/series?sort=updatedAt,desc"
            className="pb-2 text-sm font-bold text-neutral-dark relative"
          >
            ⚡️ 최신 업데이트
            <span className="absolute bottom-[-17px] left-0 h-0.5 w-full bg-neutral-dark rounded-t-full" />
          </Link>
          {/* TODO: 인기순 정렬 백엔드 지원 시 활성화 */}
          <span className="pb-2 text-sm font-bold text-neutral-300 cursor-not-allowed" title="준비 중입니다">
            🔥 인기 시리즈
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* 새 시리즈 만들기 버튼 */}
          <Link href="/series/new" prefetch={false}>
            <Button className="rounded-lg h-9 text-xs sm:text-sm font-bold bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 transition-colors gap-1.5 px-3">
              <PenSquare className="h-4 w-4" />
              새 시리즈
            </Button>
          </Link>

          {/* 뷰 토글 (모바일 숨김) */}
          <div className="hidden md:flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1 shrink-0 shadow-sm">
            <button
              onClick={() => handleLayoutChange("list")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                layout === "list" ? "bg-neutral-100 text-neutral-dark shadow-sm" : "text-neutral-400 hover:text-neutral-600"
              )}
              aria-label="리스트 뷰"
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleLayoutChange("grid")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                layout === "grid" ? "bg-neutral-100 text-neutral-dark shadow-sm" : "text-neutral-400 hover:text-neutral-600"
              )}
              aria-label="그리드 뷰"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {seriesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-32 text-center shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 mb-6">
            <FolderOpen className="h-10 w-10 text-neutral-400" />
          </div>
          <h2 className="text-xl font-bold text-neutral-dark mb-2">
            아직 작성된 시리즈가 없습니다
          </h2>
          <p className="text-neutral-500 max-w-sm mb-8">
            당신의 특별한 지식과 경험을 첫 시리즈로 만들어 보세요.
          </p>
          <Link href="/series/new" prefetch={false}>
            <Button className="rounded-full px-8 py-6 font-bold bg-primary text-white shadow-md hover:bg-primary/90 hover:scale-105 transition-all text-base">
              첫 시리즈 만들기
            </Button>
          </Link>
        </div>
      ) : (
        /* Series List */
        <div className="min-h-[500px] transition-opacity duration-300">
          <div className={cn(
            layout === "list" 
              ? "flex flex-col gap-4 w-full" 
              : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          )}>
            {seriesList.map((series, idx) => {
              // UI 시각적 확인을 위해 첫 2개의 카드에만 isOwner(본인 권한)를 true로 강제 부여합니다.
              const isOwnerMock = idx < 2;
              return layout === "list"
                ? <SeriesListCard key={series.id} {...series} isOwner={isOwnerMock} />
                : <SeriesCard key={series.id} {...series} isOwner={isOwnerMock} />;
            })}
          </div>
          
          {/* Pagination */}
          {renderPagination()}
        </div>
      )}
    </div>
  );
}
