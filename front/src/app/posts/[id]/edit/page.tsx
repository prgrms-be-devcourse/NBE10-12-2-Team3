"use client";

import React, {useEffect, useState} from "react";
import {notFound, useRouter} from "next/navigation";
import {X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {RichEditor} from "@/components/editor/rich-editor";
import {PublishModal} from "@/components/common/publish-modal";
import {useThumbnail} from "@/hooks/use-thumbnail";
import {apiFetch, resolveMediaUrl} from "@/lib/api";
import {updatePost, uploadThumbnail} from "@/lib/post-api";

interface Post {
  id: number;
  title: string;
  body: string;
    thumbnailUrl?: string;
  accessLevel: "FREE" | "PAID";
  publishStatus: "PUBLIC" | "PRIVATE" | "DRAFT";
}

interface DraftPost {
    id: number;
    title: string;
    publishStatus: "PUBLIC" | "PRIVATE" | "DRAFT";
}

interface PageResponse {
    content: DraftPost[];
}

export default function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("<p></p>");
  const [accessLevel, setAccessLevel] = useState<"FREE" | "PAID">("FREE");
  const [publishStatus, setPublishStatus] = useState<"PUBLIC" | "PRIVATE" | "DRAFT">("PUBLIC");
  const [showModal, setShowModal] = useState(false);

    const [drafts, setDrafts] = useState<DraftPost[]>([]);
    const [showDraftModal, setShowDraftModal] = useState(false);

  const {
      thumbnailPreview, setThumbnailPreview, thumbnailFile, isDragging, setIsDragging,
    fileInputRef, handleThumbnailChange, handleDrop, removeThumbnail,
  } = useThumbnail(null);

  useEffect(() => {
    apiFetch<Post>(`/api/posts/${id}`)
      .then((data) => {
        setPost(data);
        setTitle(data.title);
        setBody(data.body);
        setAccessLevel(data.accessLevel);
          setPublishStatus(data.publishStatus === "DRAFT" ? "PUBLIC" : data.publishStatus);
          if (data.thumbnailUrl) setThumbnailPreview(resolveMediaUrl(data.thumbnailUrl));
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

    useEffect(() => {
        apiFetch<PageResponse>("/api/posts/me?size=50&sort=id,desc")
            .then((data) => {
                const draftList = data.content.filter(
                    (p) => p.publishStatus === "DRAFT" && String(p.id) !== id
                );
                setDrafts(draftList);
            })
            .catch(() => {
            });
    }, [id]);

    useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setShowModal(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

    if (loading) return (
        <div className="min-h-screen bg-white pt-16 flex justify-center items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"/>
        </div>
    );
  if (!post) return notFound();

  const handleSubmit = async () => {
    try {
        await updatePost(Number(id), {title, body, accessLevel, publishStatus});
        if (thumbnailFile) await uploadThumbnail(Number(id), thumbnailFile);
      router.push(`/posts/${id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "게시글 수정에 실패했습니다.");
    }
  };

    const draftButton = drafts.length > 0 && (
        <button
            type="button"
            onClick={() => setShowDraftModal(true)}
            className="w-full rounded-lg border border-neutral-200 py-2 text-xs font-semibold text-neutral-meta transition-colors hover:border-primary hover:text-primary"
        >
            임시저장된 글 불러오기 ({drafts.length})
        </button>
    );

  const sidebarSettings = (
    <>
      <div>
        <p className="mb-3 text-sm font-bold text-neutral-dark">공개 설정</p>
        <div className="flex overflow-hidden rounded-lg border border-neutral-200">
          {(["FREE", "PAID"] as const).map((level) => (
            <button key={level} type="button" onClick={() => setAccessLevel(level)}
              className={`flex-1 py-2 text-sm font-bold transition-colors ${accessLevel === level ? "bg-primary text-white" : "bg-white text-neutral-meta hover:bg-neutral-50"}`}>
              {level}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-meta">
          {accessLevel === "FREE" ? "모든 사용자가 무료로 열람할 수 있어요." : "멤버십 구독자만 열람할 수 있어요."}
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-bold text-neutral-dark">공개 범위</p>
        <div className="flex overflow-hidden rounded-lg border border-neutral-200">
          {(["PUBLIC", "PRIVATE"] as const).map((status) => (
            <button key={status} type="button" onClick={() => setPublishStatus(status)}
              className={`flex-1 py-2 text-sm font-bold transition-colors ${publishStatus === status ? "bg-primary text-white" : "bg-white text-neutral-meta hover:bg-neutral-50"}`}>
              {status === "PUBLIC" ? "공개" : "비공개"}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-meta">
          {publishStatus === "PUBLIC" ? "모든 사람이 이 글을 볼 수 있어요." : "나만 볼 수 있어요."}
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-bold text-neutral-dark">썸네일</p>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-white transition-colors ${
            isDragging ? "border-primary bg-primary/10" : "border-neutral-200 hover:border-primary hover:bg-primary/5"
          }`}
        >
          {thumbnailPreview ? (
            <>
              <img src={thumbnailPreview} alt="썸네일" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                <span className="text-xs font-bold text-white">이미지 변경</span>
              </div>
            </>
          ) : (
            <span className="text-xs text-neutral-meta">이미지 업로드</span>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
        {thumbnailPreview && (
          <button type="button" onClick={removeThumbnail} className="mt-1 text-xs text-red-400 hover:text-red-600">
            썸네일 제거
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white pt-16">
      <form onSubmit={(e) => e.preventDefault()} className="flex h-[calc(100vh-64px)]">
        <div className="flex flex-1 flex-col overflow-y-auto px-8 py-10 md:px-16 lg:px-24">
            {/* 모바일: 임시저장 불러오기 버튼 */}
            {drafts.length > 0 && (
                <button
                    type="button"
                    onClick={() => setShowDraftModal(true)}
                    className="mb-4 self-start rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-meta transition-colors hover:border-primary hover:text-primary md:hidden"
                >
                    임시저장된 글 불러오기 ({drafts.length})
                </button>
            )}

          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mb-4 w-full border-b border-neutral-200 pb-4 text-3xl font-extrabold text-neutral-900 outline-none placeholder:text-neutral-300"
          />
            <RichEditor value={body} onChange={setBody} postId={Number(id)}/>

          <div className="mt-auto flex gap-2 pt-6 md:hidden">
            <Button type="button" variant="outlined" color="secondary" onClick={() => router.back()} className="flex-1">
              취소
            </Button>
            <Button type="button" variant="filled" onClick={() => setShowModal(true)} className="flex-1">
                완료
            </Button>
          </div>
        </div>

        <aside className="hidden w-[260px] shrink-0 border-l border-neutral-100 bg-neutral-50 md:flex flex-col gap-6 px-6 py-10">
          {sidebarSettings}
          <div className="mt-auto flex flex-col gap-2">
              {draftButton}
            <Button type="button" variant="outlined" color="secondary" onClick={() => router.back()}>
              취소
            </Button>
            <Button type="button" variant="filled" onClick={handleSubmit}>
                완료
            </Button>
          </div>
        </aside>
      </form>

        {/* 임시저장 불러오기 모달 */}
        {showDraftModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl mx-4">
                    <button
                        onClick={() => setShowDraftModal(false)}
                        className="absolute right-4 top-4 rounded-full p-1 text-neutral-meta hover:bg-neutral-100"
                    >
                        <X className="h-5 w-5"/>
                    </button>
                    <h2 className="mb-1 text-lg font-bold text-neutral-dark">임시저장된 글</h2>
                    <p className="mb-4 text-sm text-neutral-meta">이어서 작성할 글을 선택하세요.</p>
                    <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                        {drafts.map((draft) => (
                            <button
                                key={draft.id}
                                onClick={() => router.push(`/posts/${draft.id}/edit`)}
                                className="flex w-full flex-col items-start rounded-xl border border-neutral-200 px-4 py-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
                            >
                  <span className="font-semibold text-neutral-dark line-clamp-1">
                    {draft.title || "(제목 없음)"}
                  </span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button type="button" variant="outlined" color="secondary"
                                onClick={() => setShowDraftModal(false)}>
                            닫기
                        </Button>
                    </div>
                </div>
            </div>
        )}

      {showModal && (
        <PublishModal
          accessLevel={accessLevel} setAccessLevel={setAccessLevel}
          publishStatus={publishStatus} setPublishStatus={setPublishStatus}
          thumbnailPreview={thumbnailPreview} thumbnailFile={thumbnailFile}
          fileInputRef={fileInputRef} isDragging={isDragging} setIsDragging={setIsDragging}
          onThumbnailChange={handleThumbnailChange}
          onDrop={handleDrop}
          onRemoveThumbnail={removeThumbnail}
          onClose={() => setShowModal(false)}
          onSubmit={() => { setShowModal(false); handleSubmit(); }}
          submitLabel="완료"
        />
      )}
    </div>
  );
}
