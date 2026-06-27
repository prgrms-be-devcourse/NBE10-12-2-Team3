"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SearchX, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/common/content-card";
import { ContentListCard } from "@/components/common/content-list-card";
import { ContentCardSkeleton } from "@/components/common/content-card-skeleton";
import { SeriesCard } from "@/components/common/series-card";
import { SeriesListCard } from "@/components/common/series-list-card";
import { SeriesCardSkeleton } from "@/components/common/series-card-skeleton";
import { CreatorCard } from "@/components/common/creator-card";
import { CreatorCardSkeleton } from "@/components/common/creator-card-skeleton";
import { cn } from "@/lib/utils";

interface Creator {
  id: number;
  nickname: string;
  subscriberCount: number;
  introduction?: string;
}

interface Series {
  id: number;
  uniqueKey?: string;
  title: string;
  body?: string;
  postCount: number;
  authorName: string;
  lastUpdatedAt?: string;
  thumbnailUrl?: string;
}

interface Post {
  id: string | number;
  uniqueKey?: string;
  title: string;
  description: string;
  accessLevel: "FREE" | "PAID";
  thumbnailUrl?: string;
  authorName: string;
  createdAt: string;
  viewCount: number;
  likeCount?: number;
  bookmarkCount?: number;
  membershipPrice?: number;
}

interface SearchResultsViewProps {
  query: string;
  posts: Post[];
  creators: Creator[];
  series: Series[];
}

export function SearchResultsView({ query, posts, creators, series }: SearchResultsViewProps) {
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get("tab") || "all";
  const pageParam = searchParams?.get("page") || "1";
  const currentPage = parseInt(pageParam, 10) || 1;
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedLayout = localStorage.getItem("search_layout") as "list" | "grid";
      if (savedLayout) {
        setLayout(savedLayout);
      }
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLayoutChange = (newLayout: "list" | "grid") => {
    setLayout(newLayout);
    localStorage.setItem("search_layout", newLayout);
  };

  const renderPagination = (totalItems: number) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="mt-12 flex justify-center">
        <div className="flex items-center gap-1.5">
          <Link href={currentPage > 1 ? `/search?q=${encodeURIComponent(query)}&tab=${activeTab}&page=${currentPage - 1}` : "#"} className={currentPage <= 1 ? "pointer-events-none" : ""}>
            <Button variant="outlined" className={cn("h-10 w-10 rounded-full p-0 flex items-center justify-center transition-all", currentPage <= 1 ? "border-transparent bg-neutral-50 text-neutral-300" : "border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800")} disabled={currentPage <= 1}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1) {
              return (
                <Link key={pageNum} href={`/search?q=${encodeURIComponent(query)}&tab=${activeTab}&page=${pageNum}`}>
                  <Button variant="outlined" className={cn("h-10 w-10 rounded-full p-0 font-bold transition-all", currentPage === pageNum ? "border-primary text-primary bg-primary/5 shadow-sm" : "border-transparent text-neutral-600 hover:bg-neutral-100")}>
                    {pageNum}
                  </Button>
                </Link>
              );
            }
            if (pageNum === 2 && currentPage > 3) return <span key={pageNum} className="px-1.5 text-neutral-400 flex items-center justify-center h-10">...</span>;
            if (pageNum === totalPages - 1 && currentPage < totalPages - 2) return <span key={pageNum} className="px-1.5 text-neutral-400 flex items-center justify-center h-10">...</span>;
            return null;
          })}

          <Link href={currentPage < totalPages ? `/search?q=${encodeURIComponent(query)}&tab=${activeTab}&page=${currentPage + 1}` : "#"} className={currentPage >= totalPages ? "pointer-events-none" : ""}>
            <Button variant="outlined" className={cn("h-10 w-10 rounded-full p-0 flex items-center justify-center transition-all", currentPage >= totalPages ? "border-transparent bg-neutral-50 text-neutral-300" : "border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800")} disabled={currentPage >= totalPages}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  // 1. 빈 검색어 / 결과 0건 처리 (Empty State)
  if (!query.trim() || (posts.length === 0 && creators.length === 0 && series.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-neutral-300 bg-white py-32 text-center shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
          <SearchX className="h-10 w-10 text-neutral-400" />
        </div>
        <h2 className="mt-6 text-xl font-bold text-neutral-dark">
          {!query.trim() ? "검색어를 입력해주세요" : "검색 결과가 없습니다"}
        </h2>
        <p className="mt-2 text-neutral-meta max-w-sm">
          {!query.trim()
            ? "찾으시는 키워드를 입력하시면 관련된 다양한 인사이트를 보여드립니다."
            : "다른 키워드로 검색하거나 스펠링을 확인해 보세요. 추천 검색어를 둘러보는 건 어떨까요?"}
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/search?q=프론트엔드">
            <Button variant="outlined" className="rounded-full px-6 font-bold hover:bg-neutral-100 transition-colors">
              #프론트엔드
            </Button>
          </Link>
          <Link href="/search?q=아키텍처">
            <Button variant="outlined" className="rounded-full px-6 font-bold hover:bg-neutral-100 transition-colors">
              #아키텍처
            </Button>
          </Link>
          <Link href="/search?q=React">
            <Button className="rounded-full px-6 font-bold bg-primary text-white shadow-md hover:bg-primary/90 hover:scale-105 transition-transform">
              인기 키워드 탐색
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 렌더링 준비 전 스켈레톤 노출 (깜빡임 방지 및 CLS 방어)
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-12">
        {/* 탭 네비게이션 스켈레톤 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <div className="flex items-center gap-6 overflow-x-auto sm:overflow-x-visible sm:flex-wrap scrollbar-hide">
            <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-neutral-200 rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-neutral-200 rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-neutral-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* 게시글 스켈레톤 */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-dark">관련 게시글</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <ContentCardSkeleton />
            <ContentCardSkeleton />
            <ContentCardSkeleton className="hidden sm:flex" />
            <ContentCardSkeleton className="hidden md:flex" />
            <ContentCardSkeleton className="hidden lg:flex" />
          </div>
        </section>

        {/* 시리즈 스켈레톤 */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-dark">관련 시리즈</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <SeriesCardSkeleton />
            <SeriesCardSkeleton />
            <SeriesCardSkeleton className="hidden md:block" />
            <SeriesCardSkeleton className="hidden md:block" />
            <SeriesCardSkeleton className="hidden lg:block" />
          </div>
        </section>

        {/* 창작자 스켈레톤 */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-dark">관련 창작자</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pb-4">
            <CreatorCardSkeleton />
            <CreatorCardSkeleton />
            <CreatorCardSkeleton className="hidden md:flex" />
            <CreatorCardSkeleton className="hidden lg:flex" />
            <CreatorCardSkeleton className="hidden lg:flex" />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {/* 탭 네비게이션 & 뷰 모드 토글 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-6 overflow-x-auto sm:overflow-x-visible sm:flex-wrap scrollbar-hide">
          {(["all", "posts", "series", "creators"] as const).map((tab) => {
            const count = tab === "posts" ? posts.length : tab === "series" ? series.length : tab === "creators" ? creators.length : -1;
            const isDisabled = count === 0;

            return (
              <Link
                key={tab}
                href={isDisabled ? "#" : `/search?q=${encodeURIComponent(query)}&tab=${tab}&page=1`}
                onClick={(e) => {
                  if (isDisabled) e.preventDefault();
                }}
                className={cn(
                  "pb-4 text-sm font-bold transition-colors relative whitespace-nowrap",
                  isDisabled 
                    ? "text-neutral-300 pointer-events-none" 
                    : activeTab === tab 
                      ? "text-neutral-dark" 
                      : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                {tab === "all" && "통합 검색"}
                {tab === "posts" && `게시글 (${posts.length})`}
                {tab === "series" && `시리즈 (${series.length})`}
                {tab === "creators" && `창작자 (${creators.length})`}
                {activeTab === tab && !isDisabled && (
                  <span className="absolute bottom-[-1px] left-0 h-0.5 w-full bg-neutral-dark rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>

        {(activeTab === "all" || activeTab === "posts" || activeTab === "series") && (
          <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1 shrink-0">
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
        )}
      </div>

      {/* 1단: 게시글 (리스트 뷰 혹은 그리드 뷰) */}
      {(activeTab === "all" || activeTab === "posts") && posts.length > 0 && (
        <section>
          {activeTab === "all" && (
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-dark">관련 게시글</h2>
              {posts.length > 5 && (
                <Link href={`/search?q=${encodeURIComponent(query)}&tab=posts&page=1`} className="text-sm font-semibold text-neutral-meta hover:text-primary transition-colors">
                  전체보기
                </Link>
              )}
            </div>
          )}
          <div className={cn(
            layout === "list" ? "flex flex-col gap-3 max-w-5xl mx-auto w-full" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          )}>
            {(activeTab === "all" ? posts.slice(0, 5) : posts.slice(startIndex, endIndex)).map((post) => (
              layout === "list"
                ? <ContentListCard key={post.uniqueKey || post.id} {...post} />
                : <ContentCard key={post.uniqueKey || post.id} {...post} />
            ))}
          </div>
          
          {/* Pagination (통합 탭에서는 무조건 숨김, 게시글 탭에서만 조건부 노출) */}
          {activeTab === "posts" && renderPagination(posts.length)}
        </section>
      )}

      {/* 2단: 시리즈 (리스트 뷰 혹은 그리드 뷰) */}
      {(activeTab === "all" || activeTab === "series") && series.length > 0 && (
        <section>
          {activeTab === "all" && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-dark">관련 시리즈</h2>
              {series.length > 5 && (
                <Link href={`/search?q=${encodeURIComponent(query)}&tab=series&page=1`} className="text-sm font-semibold text-neutral-meta hover:text-primary transition-colors">
                  전체보기
                </Link>
              )}
            </div>
          )}
          <div className={cn(
            layout === "list" ? "flex flex-col gap-3 max-w-5xl mx-auto w-full" : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
          )}>
            {(activeTab === "all" ? series.slice(0, 5) : series.slice(startIndex, endIndex)).map((s) => (
              layout === "list"
                ? <SeriesListCard key={s.uniqueKey || s.id} {...s} body={s.body || ""} lastUpdatedAt={s.lastUpdatedAt || ""} />
                : <SeriesCard key={s.uniqueKey || s.id} {...s} body={s.body || ""} lastUpdatedAt={s.lastUpdatedAt || ""} />
            ))}
          </div>
          
          {/* 시리즈 Pagination */}
          {activeTab === "series" && renderPagination(series.length)}
        </section>
      )}

      {/* 3단: 창작자 (가로 배열 또는 그리드 뷰) */}
      {(activeTab === "all" || activeTab === "creators") && creators.length > 0 && (
        <section>
          {activeTab === "all" && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-dark">관련 창작자</h2>
              {creators.length > 5 && (
                <Link href={`/search?q=${encodeURIComponent(query)}&tab=creators&page=1`} className="text-sm font-semibold text-neutral-meta hover:text-primary transition-colors">
                  전체보기
                </Link>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pb-4">
            {(activeTab === "all" ? creators.slice(0, 5) : creators.slice(startIndex, endIndex)).map((creator) => (
              <CreatorCard
                key={creator.id}
                id={creator.id}
                nickname={creator.nickname}
                subscriberCount={creator.subscriberCount}
                introduction={creator.introduction}
                className="w-full"
              />
            ))}
          </div>
          
          {/* 창작자 Pagination */}
          {activeTab === "creators" && renderPagination(creators.length)}
        </section>
      )}
    </div>
  );
}
