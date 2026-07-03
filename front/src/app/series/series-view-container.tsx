"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import Link from "next/link";
import {FolderOpen, LayoutGrid, List as ListIcon, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {SeriesCard} from "@/components/common/series-card";
import {SeriesListCard} from "@/components/common/series-list-card";
import {cn} from "@/lib/utils";
import {useAuth} from "@/providers/auth-provider";
import {getSeriesList} from "@/lib/series-api";
import {MEDIA_BASE} from "@/lib/api";

interface Series {
  id: number | string;
    userId: number;
  title: string;
  body?: string;
  postCount?: number;
  authorName?: string;
  lastUpdatedAt: string;
  thumbnailUrl?: string;
}

interface SeriesViewContainerProps {
    initialSeries: Series[];
    initialHasNext: boolean;
}

export function SeriesViewContainer({initialSeries, initialHasNext}: SeriesViewContainerProps) {
    const {user} = useAuth();
    const [seriesList, setSeriesList] = useState<Series[]>(initialSeries);
    const [hasNext, setHasNext] = useState(initialHasNext);
    const [nextPage, setNextPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [layout, setLayout] = useState<"list" | "grid">("grid");
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedLayout = localStorage.getItem("search_layout") as "list" | "grid";
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (savedLayout) setLayout(savedLayout);
    }, []);

  const handleLayoutChange = (newLayout: "list" | "grid") => {
    setLayout(newLayout);
    localStorage.setItem("search_layout", newLayout);
  };

    const handleLoadMore = useCallback(async () => {
        if (isLoading || !hasNext) return;
        setIsLoading(true);
        try {
            const data = await getSeriesList(nextPage);
            const newItems = data.content.map((s) => ({
                id: s.id,
                userId: s.userId,
                title: s.title,
                body: s.body,
                postCount: s.postCount,
                authorName: s.nickname,
                lastUpdatedAt: s.updatedAt ? s.updatedAt.split("T")[0] : "",
                thumbnailUrl: s.thumbnailUrl ? `${MEDIA_BASE}/${s.thumbnailUrl}` : "",
            }));
            setSeriesList((prev) => [...prev, ...newItems]);
            setHasNext(!data.last);
            setNextPage((p) => p + 1);
        } catch {
            // 로드 실패 시 무시
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasNext, nextPage]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) handleLoadMore();
            },
            {threshold: 0.1}
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [handleLoadMore]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-20">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200 sticky top-0 bg-neutral-50/90 backdrop-blur-md z-30 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-6">
          <span className="pb-2 text-sm font-bold text-neutral-dark relative">
            ⚡️ 최신 업데이트
            <span className="absolute bottom-[-17px] left-0 h-0.5 w-full bg-neutral-dark rounded-t-full" />
          </span>
        </div>

          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1">
              <button
                  onClick={() => handleLayoutChange("grid")}
                  className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      layout === "grid" ? "bg-primary text-white" : "text-neutral-500 hover:text-neutral-dark"
                  )}
              >
                  <LayoutGrid className="h-4 w-4"/>
                  그리드
              </button>
              <button
                  onClick={() => handleLayoutChange("list")}
                  className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      layout === "list" ? "bg-primary text-white" : "text-neutral-500 hover:text-neutral-dark"
                  )}
              >
                  <ListIcon className="h-4 w-4"/>
                  목록
              </button>
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
            {user && (
                <Link href="/series/new" prefetch={false}>
                    <Button
                        className="rounded-full px-8 py-6 font-bold bg-primary text-white shadow-md hover:bg-primary/90 hover:scale-105 transition-all text-base">
                        첫 시리즈 만들기
                    </Button>
                </Link>
            )}
        </div>
      ) : (
          <div className="min-h-[500px]">
          <div className={cn(
              layout === "list"
                  ? "flex flex-col gap-4 w-full"
              : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          )}>
              {seriesList.map((series) => {
                  const isOwner = !!user && user.id === series.userId;
                  const handleDelete = () => setSeriesList(prev => prev.filter(s => s.id !== series.id));
              return layout === "list"
                  ? <SeriesListCard key={series.id} {...series} isOwner={isOwner} onDelete={handleDelete}/>
                  : <SeriesCard key={series.id} {...series} isOwner={isOwner} onDelete={handleDelete}/>;
            })}
          </div>

              {/* 무한스크롤 sentinel */}
              {hasNext && (
                  <div ref={sentinelRef} className="mt-12 flex justify-center h-10">
                      {isLoading && <Loader2 className="h-6 w-6 animate-spin text-neutral-400"/>}
                  </div>
              )}
        </div>
      )}
    </div>
  );
}
