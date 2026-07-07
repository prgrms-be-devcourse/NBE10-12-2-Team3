"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SeriesList } from "@/components/common/series-list";
import { SeriesPagination } from "@/components/common/series-pagination";
import { useAuth } from "@/providers/auth-provider";
import { apiFetch, ApiError } from "@/lib/api";
import type { SeriesListResponse } from "@/app/users/[id]/page";

const PAGE_SIZE = 10;

// Swagger 확정 스펙: GET /api/series/users/{userId} → RsData<PageResponseSeriesListResponse>
interface PageResponse {
  content: SeriesListResponse[];
  totalPages: number;
}

export function MySeriesList() {
  const { user, isLoggedIn } = useAuth();
  const [items, setItems] = useState<SeriesListResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchMySeries() {
      // user가 null로 확정된 경우(비로그인)에도 로딩 상태를 풀어줘야 스피너가 멈추지 않는 문제를 막습니다.
      if (!user) {
        if (!ignore) {
          setItems([]);
          setIsLoading(false);
        }
        return;
      }
      setIsLoading(true);
      try {
        const pageResponse = await apiFetch<PageResponse>(
          `/api/series/users/${user.id}?page=${currentPage - 1}&size=${PAGE_SIZE}`
        );
        if (!ignore) {
          setItems(pageResponse.content);
          setTotalPages(pageResponse.totalPages || 1);
        }
      } catch (e) {
        if (ignore) return;
        // 비로그인 상태(401)는 예상된 상태라 에러로 로깅하지 않음.
        if (!(e instanceof ApiError && e.status === 401)) {
          console.error(e);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchMySeries();
    return () => {
      ignore = true;
    };
  }, [user, currentPage, isLoggedIn]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SeriesList series={items} isOwner />
      <SeriesPagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
