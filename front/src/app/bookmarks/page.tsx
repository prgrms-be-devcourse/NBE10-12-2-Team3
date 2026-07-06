"use client";

import React, {useEffect, useState} from "react";
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
    totalPages: number;
    totalElements: number;
    pageNumber: number;
    isLast: boolean;
}

export default function BookmarksPage() {
    const {isLoggedIn} = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<BookmarkedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    useEffect(() => {
        if (!isLoggedIn) {
            setLoading(false);
            router.push("/users/login");
            return;
        }
        apiFetch<PageResponse>("/api/bookmarks/me?size=50")
            .then((data) => setPosts(data.content))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [isLoggedIn, router]);

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

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 pt-20 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mt-20"/>
            </div>
        );
    }

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

                {posts.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-neutral-300 bg-white py-32 text-center">
                        <Bookmark className="h-12 w-12 text-neutral-300 mb-4"/>
                        <p className="text-neutral-meta font-medium">북마크한 게시글이 없습니다.</p>
                    </div>
                ) : viewMode === "grid" ? (
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
                )}
            </div>
        </div>
    );
}
