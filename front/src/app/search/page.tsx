import React from "react";
import {Search} from "lucide-react";
import {SearchResultsView} from "./search-results-view";
import {searchSeries} from "@/lib/series-api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

async function searchPosts(keyword: string, page: number = 0) {
    try {
        const res = await fetch(`${BASE_URL}/api/posts/search?keyword=${encodeURIComponent(keyword)}&size=10&page=${page}&sort=id,desc`, { cache: "no-store" });
        if (!res.ok) return { content: [], totalPages: 0, totalElements: 0 };
        const json = await res.json();
        return {
            content: json.data?.content ?? [],
            totalPages: json.data?.totalPages ?? 0,
            totalElements: json.data?.totalElements ?? 0,
        };
    } catch {
        return { content: [], totalPages: 0, totalElements: 0 };
    }
}

async function searchUsers(keyword: string) {
    try {
        const res = await fetch(`${BASE_URL}/api/users/search?keyword=${encodeURIComponent(keyword)}&size=20`, { cache: "no-store" });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data?.content ?? [];
    } catch {
        return [];
    }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const rawQuery = resolvedParams.q || "";
  const query = decodeURIComponent(rawQuery).trim();
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const backendPage = currentPage - 1;

  const [postsResult, rawUsers] = await Promise.all([
    query ? searchPosts(query, backendPage) : Promise.resolve({ content: [], totalPages: 0, totalElements: 0 }),
    query ? searchUsers(query) : Promise.resolve([]),
  ]);

  const posts = postsResult.content.map((p: {
    id: number; title: string; body?: string; accessLevel: "FREE" | "PAID";
    nickname: string; createdAt: string; viewCount: number;
  }) => ({
    id: p.id,
    title: p.title,
    description: p.body ? p.body.replace(/<[^>]*>/g, "").slice(0, 100) : "",
    accessLevel: p.accessLevel,
    authorName: p.nickname,
    createdAt: p.createdAt ? p.createdAt.split("T")[0] : "",
    viewCount: p.viewCount ?? 0,
  }));

  const creators = rawUsers.map((u: { id: number; nickname: string; introduction?: string }) => ({
    id: u.id,
    nickname: u.nickname,
    subscriberCount: 0,
    introduction: u.introduction,
  }));

  let series: Array<{
    id: number; userId: number; title: string; body: string;
    postCount: number; authorName: string; lastUpdatedAt: string; thumbnailUrl?: string;
  }> = [];

  if (query) {
    try {
      const data = await searchSeries(query, 0);
      series = data.content.map((s) => ({
        id: s.id,
        userId: s.userId,
        title: s.title,
        body: s.body ?? "",
        postCount: s.postCount ?? 0,
        authorName: s.nickname,
        lastUpdatedAt: s.updatedAt ? s.updatedAt.split("T")[0] : "",
        thumbnailUrl: s.thumbnailUrl ?? undefined,
      }));
    } catch {
      series = [];
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 pt-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-dark flex items-center gap-3">
            <Search className="h-8 w-8 text-primary" />
            {query ? (
              <span>
                <span className="text-primary">&quot;{query}&quot;</span> 통합 검색 결과
              </span>
            ) : (
              <span>탐색</span>
            )}
            {query && (
              <span className="ml-2 rounded-full bg-neutral-200/50 px-3 py-1 text-sm font-bold text-neutral-500">
                총 {postsResult.totalElements + creators.length + series.length}건
              </span>
            )}
          </h1>
          <p className="mt-2 text-neutral-meta">
            현업 상위 1% 개발자들의 인사이트를 찾아보세요.
          </p>
        </div>

        <SearchResultsView
          query={query}
          posts={posts}
          postsTotalElements={postsResult.totalElements}
          creators={creators}
          series={series}
        />
      </div>
    </div>
  );
}
