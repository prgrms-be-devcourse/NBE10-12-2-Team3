"use client";

import React, { useState, useEffect } from "react";
import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ContentListCard } from "@/components/common/content-list-card";
import { ContentCard } from "@/components/common/content-card";
import { cn } from "@/lib/utils";

interface Post {
  id: string | number;
  title: string;
  description: string;
  accessLevel: "FREE" | "PAID";
  authorName: string;
  createdAt: string;
  viewCount: number;
  thumbnailUrl?: string;
}

interface SeriesDetailPostListProps {
  posts: Post[];
  totalPosts: number;
  currentPage: number;
  totalPages: number;
}

export function SeriesDetailPostList({ posts, totalPosts, currentPage, totalPages }: SeriesDetailPostListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [layout, setLayout] = useState<"grid" | "list">("list");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedLayout = localStorage.getItem("series_detail_layout") as "grid" | "list";
    if (savedLayout === "grid" || savedLayout === "list") {
      setLayout(savedLayout);
    }
  }, []);

  const handleLayoutChange = (newLayout: "grid" | "list") => {
    setLayout(newLayout);
    localStorage.setItem("series_detail_layout", newLayout);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", newPage.toString());
    // pathname을 모를 경우 window.location.pathname 활용
    router.push(`${window.location.pathname}?${params.toString()}`);
    
    // 페이지 이동 시 살짝 위로 스크롤 (목록 시작 위치쯤)
    window.scrollTo({ top: 600, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="mt-16 flex justify-center">
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

  if (!isMounted) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-extrabold text-neutral-dark flex items-center gap-3">
          포스트 목록 
          <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">{totalPosts}</span>
        </h2>
        
        {/* 뷰 토글 버튼 */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-neutral-200">
          <button
            onClick={() => handleLayoutChange("grid")}
            className={`p-2.5 rounded-lg transition-all ${
              layout === "grid"
                ? "bg-primary text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50"
            }`}
            title="바둑판 뷰"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleLayoutChange("list")}
            className={`p-2.5 rounded-lg transition-all ${
              layout === "list"
                ? "bg-primary text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50"
            }`}
            title="리스트 뷰"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-neutral-300 text-neutral-500 shadow-sm">
          아직 이 시리즈에 포함된 포스트가 없습니다.
        </div>
      ) : (
        <div
          className={
            layout === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              : "flex flex-col gap-6"
          }
        >
          {posts.map((post, idx) => {
            // 역순 번호 계산: 전체 포스트 수에서 현재까지의 인덱스를 뺌
            const displayIndex = totalPosts - ((currentPage - 1) * 10 + idx);

            if (layout === "grid") {
              return (
                <div key={post.id} className="relative group h-full">
                  {/* Grid 뷰용 뱃지 (목록형과 동일하게 숫자만 노출) */}
                  <div className="absolute -top-3 -left-3 z-20">
                    <div className="bg-white text-neutral-400 border-2 border-neutral-200 font-black text-sm w-9 h-9 flex items-center justify-center rounded-full shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:scale-110 transition-all duration-300">
                      {displayIndex}
                    </div>
                  </div>
                  <ContentCard {...post} className="h-full" />
                </div>
              );
            }

            // List 뷰
            return (
              <div key={post.id} className="relative group flex gap-0 sm:gap-6">
                {/* 타임라인 인디케이터 (데스크탑에서만 노출) */}
                <div className="hidden sm:flex flex-col items-center shrink-0 w-12 pt-4">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center font-black text-neutral-400 text-lg group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:scale-110 shadow-sm transition-all duration-300 z-10">
                    {displayIndex}
                  </div>
                  {idx !== posts.length - 1 && (
                    <div className="w-0.5 h-full bg-neutral-200 mt-2 mb-2 group-hover:bg-primary/30 transition-colors" />
                  )}
                </div>
                
                {/* 포스트 리스트 카드 */}
                <div className="flex-1 w-full pb-2">
                  <ContentListCard {...post} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 페이징 영역 */}
      {renderPagination()}
    </section>
  );
}
