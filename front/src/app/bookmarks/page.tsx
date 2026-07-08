"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {Bookmark, LayoutGrid, List} from "lucide-react";
import {ContentCard} from "@/components/common/content-card";
import {ContentListCard} from "@/components/common/content-list-card";
import {cn} from "@/lib/utils";
import {apiDelete, apiFetch, apiPost} from "@/lib/api";
import {useAuth} from "@/providers/auth-provider";
import {useRouter} from "next/navigation";

interface BookmarkedPost {
    id: number;
    userId: number;
    nickname: string;
    seriesId: number | null;
    title: string;
    publishStatus: string;
    accessLevel: "FREE" | "PAID";
    viewCount: number;
    likeCount: number;
    bookmarkCount: number;
    isLiked: boolean;
    isBookmarked: boolean;
    createdAt: string;
}

interface PageResponse {
    content: BookmarkedPost[];
    last: boolean;
}

const PAGE_SIZE = 10;

export default function BookmarksPage() {
    const {isLoggedIn} = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<BookmarkedPost[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const isLoadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const pageRef = useRef(0);
    const hasLoadedRef = useRef(false);
    const observerRef = useRef<HTMLDivElement | null>(null);

    const loadMore = useCallback(async () => {
        if (!isLoggedIn || isLoadingRef.current || !hasMoreRef.current) return;
        isLoadingRef.current = true;
        setIsLoading(true);
        try {
            const data = await apiFetch<PageResponse>(`/api/bookmarks/me?page=${pageRef.current}&size=${PAGE_SIZE}`);
            setPosts((prev) => {
                const existingIds = new Set(prev.map(p => p.id));
                return [...prev, ...data.content.filter((p: BookmarkedPost) => !existingIds.has(p.id))];
            });
            const noMore = data.last || data.content.length === 0;
            hasMoreRef.current = !noMore;
            setHasMore(!noMore);
            pageRef.current += 1;
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            isLoadingRef.current = false;
            setIsLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn) {
            router.push("/users/login");
            return;
        }
        if (!hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadMore();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            {threshold: 0.1}
        );
        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [loadMore]);

    const handleLike = async (postId: number, currentlyLiked: boolean) => {
        try {
            if (currentlyLiked) {
                await apiDelete(`/api/posts/${postId}/likes`);
            } else {
                await apiPost(`/api/posts/${postId}/likes`);
            }
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId
                        ? {
                            ...p,
                            isLiked: !currentlyLiked,
                            likeCount: currentlyLiked ? p.likeCount - 1 : p.likeCount + 1
                        }
                        : p
                )
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleBookmark = async (postId: number) => {
        try {
            await apiDelete(`/api/posts/${postId}/bookmarks`);
            setPosts((prev) => prev.filter((p) => p.id !== postId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 pb-20 pt-20">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-dark flex items-center gap-3">
                        <Bookmark className="h-7 w-7 text-primary fill-primary/20"/>
                        내 북마크
                    </h1>
                    <div className="flex items-center gap-1 rounded-lg border border-neutral-border bg-white p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                viewMode === "grid" ? "bg-primary text-white" : "text-neutral-meta hover:text-neutral-dark"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4"/>
                            그리드
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                viewMode === "list" ? "bg-primary text-white" : "text-neutral-meta hover:text-neutral-dark"
                            )}
                        >
                            <List className="h-4 w-4"/>
                            목록
                        </button>
                    </div>
                </div>

                {/* 에러 상태 */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-24 text-neutral-meta">
                        <p className="text-lg font-medium">북마크를 불러오지 못했습니다.</p>
                        <p className="mt-1 text-sm">잠시 후 다시 시도해 주세요.</p>
                    </div>
                )}

                {/* 빈 상태 */}
                {!error && !isLoading && posts.length === 0 && (
                    <div
                        className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-neutral-300 bg-white py-32 text-center">
                        <Bookmark className="h-12 w-12 text-neutral-300 mb-4"/>
                        <p className="text-neutral-meta font-medium">북마크한 게시글이 없습니다.</p>
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
                                    authorName={post.nickname}
                                    createdAt={post.createdAt.split("T")[0]}
                                    viewCount={post.viewCount}
                                    likeCount={post.likeCount}
                                    bookmarkCount={post.bookmarkCount}
                                    isLiked={post.isLiked}
                                    isBookmarked={true}
                                    onLike={() => handleLike(post.id, post.isLiked)}
                                    onBookmark={() => handleBookmark(post.id)}
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
                                    authorName={post.nickname}
                                    createdAt={post.createdAt.split("T")[0]}
                                    viewCount={post.viewCount}
                                    likeCount={post.likeCount}
                                    bookmarkCount={post.bookmarkCount}
                                    isLiked={post.isLiked}
                                    isBookmarked={true}
                                    onLike={() => handleLike(post.id, post.isLiked)}
                                    onBookmark={() => handleBookmark(post.id)}
                                />
                            ))}
                        </div>
                    )
                )}

                {/* 무한 스크롤 트리거 - 더 불러올 데이터가 있을 때만 */}
                {hasMore && <div ref={observerRef} className="h-10 mt-8"/>}
                {isLoading && (
                    <div className="flex justify-center py-4">
                        <div
                            className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"/>
                    </div>
                )}
                {!hasMore && posts.length > 0 && (
                    <p className="text-center text-sm text-neutral-meta py-4">모든 북마크를 불러왔습니다.</p>
                )}
            </div>
        </div>
    );
}
