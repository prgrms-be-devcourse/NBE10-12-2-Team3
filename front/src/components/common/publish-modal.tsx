"use client";

import React from "react";
import { X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublishModalProps {
  accessLevel: "FREE" | "PAID";
  setAccessLevel: (v: "FREE" | "PAID") => void;
  publishStatus: "PUBLIC" | "PRIVATE";
  setPublishStatus: (v: "PUBLIC" | "PRIVATE") => void;
  thumbnailPreview: string | null;
  thumbnailFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  onThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveThumbnail: () => void;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
}

export function PublishModal({
  accessLevel, setAccessLevel,
  publishStatus, setPublishStatus,
  thumbnailPreview, thumbnailFile,
  fileInputRef, isDragging, setIsDragging,
  onThumbnailChange, onDrop, onRemoveThumbnail,
  onClose, onSubmit,
  submitLabel = "발행",
}: PublishModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl mx-4">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-neutral-900">발행 설정</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-neutral-100">
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* 공개 설정 */}
        <div className="mb-5">
          <p className="mb-2 text-sm font-bold text-neutral-700">공개 설정</p>
          <div className="flex overflow-hidden rounded-lg border border-neutral-200">
            {(["FREE", "PAID"] as const).map((level) => (
              <button key={level} type="button" onClick={() => setAccessLevel(level)}
                className={`flex-1 py-2 text-sm font-bold transition-colors ${accessLevel === level ? "bg-primary text-white" : "bg-white text-neutral-500 hover:bg-neutral-50"}`}>
                {level}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-neutral-400">
            {accessLevel === "FREE" ? "모든 사용자가 무료로 열람할 수 있어요." : "멤버십 구독자만 열람할 수 있어요."}
          </p>
        </div>

        {/* 공개 범위 */}
        <div className="mb-5">
          <p className="mb-2 text-sm font-bold text-neutral-700">공개 범위</p>
          <div className="flex overflow-hidden rounded-lg border border-neutral-200">
            <button type="button" onClick={() => setPublishStatus("PUBLIC")}
              className={`flex-1 py-2 text-sm font-bold transition-colors ${publishStatus === "PUBLIC" ? "bg-primary text-white" : "bg-white text-neutral-500 hover:bg-neutral-50"}`}>
              공개
            </button>
            <button type="button" onClick={() => setPublishStatus("PRIVATE")}
              className={`flex-1 py-2 text-sm font-bold transition-colors ${publishStatus === "PRIVATE" ? "bg-primary text-white" : "bg-white text-neutral-500 hover:bg-neutral-50"}`}>
              비공개
            </button>
          </div>
          <p className="mt-1.5 text-xs text-neutral-400">
            {publishStatus === "PUBLIC" ? "모든 사람이 이 글을 볼 수 있어요." : "나만 볼 수 있어요."}
          </p>
        </div>

        {/* 썸네일 */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-bold text-neutral-700">썸네일</p>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`relative flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-white transition-colors ${
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
              <div className="flex flex-col items-center gap-1 text-neutral-400">
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs">이미지 업로드</span>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onThumbnailChange} className="hidden" />
          {thumbnailPreview && (
            <button type="button" onClick={onRemoveThumbnail} className="mt-1 text-xs text-red-400 hover:text-red-600">
              썸네일 제거
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outlined" color="secondary" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button type="button" variant="filled" onClick={onSubmit} className="flex-1">
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
