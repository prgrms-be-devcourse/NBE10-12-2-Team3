"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MOCK_POSTS } from "@/lib/mock-data";
import { ContentCard } from "@/components/common/content-card";
import { ContentListCard } from "@/components/common/content-list-card";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

export default function PostsPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
    const [isLoading, setIsLoading] = useState(false);
    const observerRef = useRef<HTMLDivElement | null>(null);

    const posts = MOCK_POSTS.slice(0, displayCount);
    const hasMore = displayCount < MOCK_POSTS.length;

    const loadMore = useCallback(() => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        setTimeout(() => {
            setDisplayCount((prev) => prev + PAGE_SIZE);
            setIsLoading(false);
        }, 500);
    }, [isLoading, hasMore]);

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
                        게시글
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

                {/* 게시글 목록 */}
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {posts.map((post) => (
                            <ContentCard
                                key={post.id}
                                id={post.id}
                                title={post.title}
                                description={post.description}
                                accessLevel={post.accessLevel}
                                thumbnailUrl={post.thumbnailUrl}
                                authorName={post.authorName}
                                createdAt={post.createdAt}
                                viewCount={post.viewCount}
                                likeCount={post.likeCount}
                                bookmarkCount={post.bookmarkCount}
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
                                description={post.description}
                                accessLevel={post.accessLevel}
                                thumbnailUrl={post.thumbnailUrl}
                                authorName={post.authorName}
                                createdAt={post.createdAt}
                                viewCount={post.viewCount}
                                likeCount={post.likeCount}
                                bookmarkCount={post.bookmarkCount}
                            />
                        ))}
                    </div>
                )}

                {/* 무한 스크롤 트리거 */}
                <div ref={observerRef} className="h-10 mt-8" />
                {isLoading && (
                    <div className="flex justify-center py-4">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                )}
                {!hasMore && (
                    <p className="text-center text-sm text-neutral-meta py-4">모든 게시글을 불러왔습니다.</p>
                )}
            </div>
        </div>
    );
}
