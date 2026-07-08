"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { PostGrid } from "@/components/common/post-grid";
import { PostPagination } from "@/components/common/post-pagination";
import { useAuth } from "@/providers/auth-provider";
import { apiFetch, ApiError } from "@/lib/api";
import type { PostListResponse } from "@/app/users/[id]/page";

const PAGE_SIZE = 10;

// Swagger 확정 스펙: GET /api/posts?creatorId={id}&page={n}&size={s} → RsData<SlicePostListResponse>
// Slice 응답이라 totalPages/totalElements가 없습니다. last로만 "다음 페이지 존재 여부"를 판단합니다.
interface SliceResponse {
  content: PostListResponse[];
  last: boolean;
}

export function MyPostList() {
  const { user, isLoggedIn } = useAuth();
  const [items, setItems] = useState<PostListResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchMyPosts() {
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
        const sliceResponse = await apiFetch<SliceResponse>(
          `/api/posts?creatorId=${user.id}&page=${currentPage - 1}&size=${PAGE_SIZE}`
        );
        if (!ignore) {
          setItems(sliceResponse.content);
          setIsLastPage(sliceResponse.last);
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

    fetchMyPosts();
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
      <PostGrid posts={items} authorName={user?.nickname || ""} emptyMessage="아직 작성한 글이 없습니다." />
      <PostPagination page={currentPage} isLastPage={isLastPage} onPageChange={setCurrentPage} />
    </div>
  );
}
