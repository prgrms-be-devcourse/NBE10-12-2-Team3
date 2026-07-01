"use client";

import React, { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

interface Comment {
  id: number;
  authorName: string;
  body: string;
  createdAt: string;
}

const MOCK_COMMENTS: Comment[] = [
  { id: 1, authorName: "김도현", body: "정말 유익한 글이네요!", createdAt: "2026.06.29" },
  { id: 2, authorName: "이서연", body: "많은 도움이 됐습니다 감사합니다.", createdAt: "2026.06.29" },
];

export function CommentList() {
  const { isLoggedIn, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingBody, setEditingBody] = useState("");

  // 댓글 작성
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    // TODO: 백엔드 API 연동 (POST /api/posts/{postId}/comments)
    const comment: Comment = {
      id: Date.now(),
      authorName: user?.nickname || "익명",
      body: newComment,
      createdAt: new Date().toLocaleDateString("ko-KR").replace(/\. /g, ".").replace(".", ""),
    };
    setComments((prev) => [...prev, comment]);
    setNewComment("");
  };

  // 댓글 수정
  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditingBody(comment.body);
  };

  const handleEditSubmit = (id: number) => {
    // TODO: 백엔드 API 연동 (PUT /api/posts/{postId}/comments/{id})
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, body: editingBody } : c))
    );
    setEditingId(null);
  };

  // 댓글 삭제
  const handleDelete = (id: number) => {
    // TODO: 백엔드 API 연동 (DELETE /api/posts/{postId}/comments/{id})
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-xl font-bold text-neutral-dark">
        댓글 {comments.length}개
      </h2>

      {/* 댓글 목록 */}
      <div className="flex flex-col gap-4">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-xl border border-neutral-border bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar name={comment.authorName} size="sm" />
                <span className="text-sm font-bold text-neutral-dark">{comment.authorName}</span>
                <span className="text-xs text-neutral-meta">{comment.createdAt}</span>
              </div>
              {/* 본인 댓글만 수정/삭제 */}
              {isLoggedIn && user?.nickname === comment.authorName && (
                <div className="flex items-center gap-1">
                  {editingId === comment.id ? (
                    <>
                      <button onClick={() => handleEditSubmit(comment.id)} className="rounded p-1 text-primary hover:bg-primary/10">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="rounded p-1 text-neutral-meta hover:bg-neutral-100">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(comment)} className="rounded p-1 text-neutral-meta hover:bg-neutral-100">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(comment.id)} className="rounded p-1 text-neutral-meta hover:bg-neutral-100 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            {editingId === comment.id ? (
              <textarea
                value={editingBody}
                onChange={(e) => setEditingBody(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-neutral-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            ) : (
              <p className="text-sm leading-relaxed text-neutral-600">{comment.body}</p>
            )}
          </div>
        ))}
      </div>

      {/* 댓글 작성 */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력해주세요"
            rows={3}
            className="w-full rounded-xl border border-neutral-border bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          <div className="flex justify-end">
            <Button type="submit" variant="filled" size="sm">
              댓글 등록
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-xl border border-neutral-border bg-white px-4 py-6 text-center text-sm text-neutral-meta">
          댓글을 작성하려면 로그인이 필요합니다.
        </div>
      )}
    </div>
  );
}
