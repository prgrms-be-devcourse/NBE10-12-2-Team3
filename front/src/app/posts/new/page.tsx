"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RichEditor } from "@/components/editor/rich-editor";
import { PublishModal } from "@/components/common/publish-modal";
import { useThumbnail } from "@/hooks/use-thumbnail";

export default function PostNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("<p></p>");
  const [accessLevel, setAccessLevel] = useState<"FREE" | "PAID">("FREE");
  const [publishStatus, setPublishStatus] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [showModal, setShowModal] = useState(false);

  const {
    thumbnailPreview, thumbnailFile, isDragging, setIsDragging,
    fileInputRef, handleThumbnailChange, handleDrop, removeThumbnail,
  } = useThumbnail();

  React.useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setShowModal(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = () => {
    // TODO: 백엔드 API 연동 (POST /api/posts)
    console.log({ title, body, accessLevel, publishStatus, thumbnailFile });
    router.push("/posts");
  };

  const sidebarSettings = (
    <>
      {/* 공개 설정 */}
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

      {/* 공개 범위 */}
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

      {/* 썸네일 */}
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
        {/* 왼쪽: 제목 + 본문 */}
        <div className="flex flex-1 flex-col overflow-y-auto px-8 py-10 md:px-16 lg:px-24">
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mb-4 w-full border-b border-neutral-200 pb-4 text-3xl font-extrabold text-neutral-900 outline-none placeholder:text-neutral-300"
          />
          <RichEditor value={body} onChange={setBody} />

          {/* 모바일 하단 버튼 */}
          <div className="mt-auto flex gap-2 pt-6 md:hidden">
            <Button type="button" variant="outlined" color="secondary" onClick={() => router.back()} className="flex-1">
              임시저장
            </Button>
            <Button type="button" variant="filled" onClick={() => setShowModal(true)} className="flex-1">
              발행
            </Button>
          </div>
        </div>

        {/* 오른쪽: 사이드바 (데스크탑만) */}
        <aside className="hidden w-[260px] shrink-0 border-l border-neutral-100 bg-neutral-50 md:flex flex-col gap-6 px-6 py-10">
          {sidebarSettings}
          <div className="mt-auto flex flex-col gap-2">
            <Button type="button" variant="outlined" color="secondary" onClick={() => router.back()}>
              임시저장
            </Button>
            <Button type="button" variant="filled" onClick={handleSubmit}>
              발행
            </Button>
          </div>
        </aside>
      </form>

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
        />
      )}
    </div>
  );
}
