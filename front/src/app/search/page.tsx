import React from "react";
import {Search} from "lucide-react";
import {MOCK_CREATORS, MOCK_POSTS} from "@/lib/mock-data";
import {SearchResultsView} from "./search-results-view";
import {searchSeries} from "@/lib/series-api";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;

  const rawQuery = resolvedParams.q || "";
  const query = decodeURIComponent(rawQuery).trim();

    // 게시글 모의 데이터 필터링 (Post 도메인 연동 전)
    const posts = query
        ? MOCK_POSTS.filter(
            (p) => p.title.includes(query) || p.description.includes(query)
        )
    : [];

    // 창작자 모의 데이터 필터링 (User 도메인 연동 전)
  const creators = query
      ? MOCK_CREATORS.filter((c) => c.nickname.includes(query))
    : [];

    // 시리즈 실제 API 검색
    let series: Array<{
        id: number;
        userId: number;
        title: string;
        body: string;
        postCount: number;
        authorName: string;
        lastUpdatedAt: string;
        thumbnailUrl?: string;
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
        {/* 헤더 섹션 */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-dark flex items-center gap-3">
            <Search className="h-8 w-8 text-primary" />
            {query ? (
              <span>
                <span className="text-primary">&quot;{query}&quot;</span> 통합 검색 결과
              </span>
            ) : (
              <span>콘텐츠 탐색</span>
            )}
            {query && (
              <span className="ml-2 rounded-full bg-neutral-200/50 px-3 py-1 text-sm font-bold text-neutral-500">
                총 {posts.length + creators.length + series.length}건
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
              creators={creators}
              series={series}
        />
      </div>
    </div>
  );
}
