"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ContentCard } from "@/components/common/content-card";
import { ContentListCard } from "@/components/common/content-list-card";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

interface Post {
    id: number;
    userId: number;
    nickname: string;
    seriesId: number | null;
    title: string;
    publishStatus: "PUBLIC" | "PRIVATE";
    accessLevel: "FREE" | "PAID";
    viewCount: number;
    createdAt: string;
}

interface SliceResponse {
    content: Post[];
    last: boolean;
}

const PAGE_SIZE = 8;

export default function PostsPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const isLoadingRef = useRef(false);
    const observerRef = useRef<HTMLDivElement | null>(null);

    const loadMore = useCallback(async () => {
        if (isLoadingRef.current || !hasMore) return;
        isLoadingRef.current = true;
        setIsLoading(true);
        try {
            const data = await apiFetch<SliceResponse>(`/api/posts?page=${page}&size=${PAGE_SIZE}&sort=id,desc`);
            setPosts((prev) => {
                const existingIds = new Set(prev.map(p => p.id));
                return [...prev, ...data.content.filter((p: Post) => !existingIds.has(p.id))];
            });
            setHasMore(!data.last);
            setPage((prev) => prev + 1);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            isLoadingRef.current = false;
            setIsLoading(false);
        }
    }, [hasMore, page]);

    useEffect(() => {
        loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { threshold: 0.1 }
        );
        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [loadMore]);

    return (
        <div className="min-h-screen bg-neutral-50 pb-20 pt-20">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
                {/* 헤더 */}
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-dark">
                        포스트
                    </h1>
                    <div className="flex items-center gap-1 rounded-lg border border-neutral-border bg-white p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                viewMode === "grid"
                                    ? "bg-primary text-white"
                                    : "text-neutral-meta hover:text-neutral-dark"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            그리드
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                viewMode === "list"
                                    ? "bg-primary text-white"
                                    : "text-neutral-meta hover:text-neutral-dark"
                            )}
                        >
                            <List className="h-4 w-4" />
                            목록
                        </button>
                    </div>
                </div>

                {/* 에러 상태 */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-24 text-neutral-meta">
                        <p className="text-lg font-medium">게시글을 불러오지 못했습니다.</p>
                        <p className="mt-1 text-sm">잠시 후 다시 시도해 주세요.</p>
                    </div>
                )}

                {/* 빈 상태 */}
                {!error && !isLoading && posts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-neutral-meta">
                        <p className="text-lg font-medium">아직 게시글이 없습니다.</p>
                        <p className="mt-1 text-sm">첫 번째 글을 작성해 보세요!</p>
                    </div>
                )}

                {/* 게시글 목록 */}
                {!error && posts.length > 0 && (
                    viewMode === "grid" ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {posts.map((post) => (
                                <ContentCard
                                    key={post.id}
                                    id={post.id}
                                    title={post.title}
                                    description=""
                                    accessLevel={post.accessLevel}
                                    thumbnailUrl={undefined}
                                    authorName={post.nickname}
                                    createdAt={post.createdAt}
                                    viewCount={post.viewCount}
                                    likeCount={0}
                                    bookmarkCount={0}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {posts.map((post) => (
                                <ContentListCard
                                    key={post.id}
                                    id={post.id}
                                    title={post.title}
                                    description=""
                                    accessLevel={post.accessLevel}
                                    thumbnailUrl={undefined}
                                    authorName={post.nickname}
                                    createdAt={post.createdAt}
                                    viewCount={post.viewCount}
                                    likeCount={0}
                                    bookmarkCount={0}
                                />
                            ))}
                        </div>
                    )
                )}

                {/* 무한 스크롤 트리거 */}
                <div ref={observerRef} className="h-10 mt-8" />
                {isLoading && (
                    <div className="flex justify-center py-4">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                )}
                {!hasMore && posts.length > 0 && (
                    <p className="text-center text-sm text-neutral-meta py-4">모든 포스트를 불러왔습니다.</p>
                )}
            </div>
        </div>
    );
}
