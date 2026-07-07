"use client";

import React, { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn } from "@/lib/utils";
import { apiFetch, apiPost, apiPut, apiDelete } from "@/lib/api";

interface Comment {
    id: number;
    userId: number;
    nickname: string;
    postId: number;
    body: string;
    createdAt: string;
}

interface PageResponse {
    content: Comment[];
    totalElements: number;
}

export function CommentList({ postId, isLocked = false }: { postId: number; isLocked?: boolean }) {
    const { isLoggedIn, user } = useAuth();
    const hasMounted = useHasMounted();
    const [comments, setComments] = useState<Comment[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingBody, setEditingBody] = useState("");

    useEffect(() => {
        apiFetch<PageResponse>(`/api/posts/${postId}/comments?page=0&size=50&sort=id`)
            .then((data) => {
                setComments(data.content);
                setTotalCount(data.totalElements);
            })
            .catch(console.error);
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const created = await apiPost<Comment>(`/api/posts/${postId}/comments`, { body: newComment });
            setComments((prev) => [...prev, created]);
            setTotalCount((prev) => prev + 1);
            setNewComment("");
        } catch (err) {
            alert(err instanceof Error ? err.message : "댓글 작성에 실패했습니다.");
        }
    };

    const handleEditSubmit = async (id: number) => {
        try {
            const updated = await apiPut<Comment>(`/api/posts/${postId}/comments/${id}`, { body: editingBody });
            setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
            setEditingId(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : "댓글 수정에 실패했습니다.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("댓글을 삭제할까요?")) return;
        try {
            await apiDelete(`/api/posts/${postId}/comments/${id}`);
            setComments((prev) => prev.filter((c) => c.id !== id));
            setTotalCount((prev) => prev - 1);
        } catch (err) {
            alert(err instanceof Error ? err.message : "댓글 삭제에 실패했습니다.");
        }
    };

    return (
        <div className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-neutral-dark">
                댓글 {totalCount}개
            </h2>

            {isLocked && (
                <div className="rounded-xl border border-neutral-border bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-meta">
                    멤버십 구독자만 댓글을 볼 수 있습니다.
                </div>
            )}

            {/* 댓글 목록 */}
            {!isLocked && <div className="flex flex-col gap-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="rounded-xl border border-neutral-border bg-white p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar name={comment.nickname} size="sm" />
                                <span className="text-sm font-bold text-neutral-dark">{comment.nickname}</span>
                                <span className="text-xs text-neutral-meta">{comment.createdAt}</span>
                            </div>
                            {hasMounted && isLoggedIn && user?.id === comment.userId && (
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
                                            <button onClick={() => { setEditingId(comment.id); setEditingBody(comment.body); }} className="rounded p-1 text-neutral-meta hover:bg-neutral-100">
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
            </div>}

            {/* 댓글 작성 */}
            {!isLocked && hasMounted && isLoggedIn ? (
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
            ) : (!isLocked && (
                <div className="mt-6 rounded-xl border border-neutral-border bg-white px-4 py-6 text-center text-sm text-neutral-meta">
                    댓글을 작성하려면 로그인이 필요합니다.
                </div>
            ))}
        </div>
    );
}
