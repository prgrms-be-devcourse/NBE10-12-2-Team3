"use client";

import React, { useState } from "react";
import { MOCK_POSTS, MOCK_SERIES } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye, Heart, Bookmark, Calendar, Pencil, Trash2, BookOpen } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { BlurPaywall } from "@/components/common/blur-paywall";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { CommentList } from "@/components/comment/comment-list";
import { useRouter } from "next/navigation";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const post = MOCK_POSTS.find((p) => p.id === Number(id));
  const isAuthor = isLoggedIn && user?.nickname === post?.authorName;

  // 시리즈 연결: 같은 작성자의 첫 번째 시리즈를 연결 (TODO: 실제 API 연동 시 post.seriesId 사용)
  const series = post ? MOCK_SERIES.find((s) => s.authorName === post.authorName) : null;
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  if (!post) return notFound();

  const isPaid = post.accessLevel === "PAID";
  const canRead = !isPaid || isLoggedIn;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 pt-20">
      <div className="mx-auto max-w-[800px] px-4 sm:px-6">
        {/* 썸네일 */}
        {post.thumbnailUrl && (
          <div className="mb-8 overflow-hidden rounded-[16px]">
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* 시리즈 정보 */}
        {series && (
          <Link href={`/series/${series.id}`} className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold hover:bg-primary/20 transition-colors">
            <BookOpen className="h-3.5 w-3.5" />
            {series.title}
          </Link>
        )}

        {/* 제목 */}
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-neutral-dark">
          {post.title}
        </h1>

        {/* 작성자 & 메타 정보 */}
        <div className="mb-8 flex items-center justify-between border-b border-neutral-border pb-6">
          <div className="flex items-center gap-3">
            <Avatar name={post.authorName} size="md" />
            <div>
              <p className="font-bold text-neutral-dark">{post.authorName}</p>
              <div className="flex items-center gap-1 text-xs text-neutral-meta">
                <Calendar className="h-3 w-3" />
                {post.createdAt}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-neutral-meta">
            <div className="flex items-center gap-1 text-sm">
              <Eye className="h-4 w-4" />
              {post.viewCount.toLocaleString()}
            </div>
            <button
              onClick={() => setLiked(!liked)}
              className={cn(
                "flex items-center gap-1 text-sm transition-colors",
                liked ? "text-red-500" : "hover:text-red-400"
              )}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-red-500")} />
              {post.likeCount}
            </button>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={cn(
                "flex items-center gap-1 text-sm transition-colors",
                bookmarked ? "text-primary" : "hover:text-primary"
              )}
            >
              <Bookmark className={cn("h-4 w-4", bookmarked && "fill-primary")} />
              {post.bookmarkCount}
            </button>
          </div>
        </div>

        {/* 본문 */}
        {canRead ? (
          <div className="prose max-w-none text-neutral-dark">
            <p className="leading-relaxed text-neutral-600">{post.description}</p>
          </div>
        ) : (
          <BlurPaywall isLoggedIn={isLoggedIn} />
        )}

        {/* 수정/삭제 버튼 */}
        {isAuthor && (
          <div className="mt-10 flex justify-end gap-2 border-t border-neutral-100 pt-6">
            <button
              onClick={() => router.push(`/posts/${id}/edit`)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-600 transition-colors hover:border-primary hover:text-primary"
            >
              <Pencil className="h-4 w-4" />
              수정
            </button>
            <button
              onClick={() => {
                if (confirm("게시글을 삭제할까요?")) {
                  // TODO: 백엔드 API 연동 (DELETE /api/posts/{id})
                  router.push("/posts");
                }
              }}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-400 transition-colors hover:border-red-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              삭제
            </button>
          </div>
        )}

        {/* 댓글 */}
        <CommentList />
      </div>
    </div>
  );
}
