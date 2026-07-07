"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteSeries } from "@/lib/series-api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface SeriesListRowProps {
  id: string | number;
  title: string;
  description?: string;
  // TODO: 추후 시리즈 API 필드 확정 시 ContentCard의 accessLevel("FREE"|"PAID")과 값 체계 통일 필요
  accessLevel: "PUBLIC" | "MEMBERSHIP";
  updatedAt: string;
  postCount: number;
  thumbnailUrl?: string;
  className?: string;
  href?: string;
  isOwner?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onDelete?: () => void;
}

export function SeriesListRow({
  id,
  title,
  description,
  accessLevel,
  updatedAt,
  postCount,
  thumbnailUrl,
  className,
  href,
  isOwner = false,
  onClick,
  onDelete,
}: SeriesListRowProps) {
  const router = useRouter();
  const isMembership = accessLevel === "MEMBERSHIP";
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Kebab 메뉴 클릭 시 Link 이동 방지
  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    router.push(`/series/${id}/edit`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    try {
      await deleteSeries(id);
      if (onDelete) onDelete();
      else router.refresh();
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <>
      <ConfirmDialog
        open={showConfirm}
        title="시리즈를 삭제할까요?"
        description="삭제된 시리즈는 복구할 수 없습니다."
        confirmLabel="삭제"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
      <Link
        href={href || `/series/${id}`}
        onClick={onClick}
        className={cn(
          "group relative block w-full rounded-[16px] shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 z-10",
          className
        )}
        onMouseLeave={() => setShowMenu(false)}
      >
        {/* Stack Effect Background Layers (Hover-only Pop-out) */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 rounded-[16px] bg-neutral-300 border border-neutral-400/50 shadow-sm transition-all duration-300 origin-bottom-left group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:rotate-1" />
          <div className="absolute inset-0 rounded-[16px] bg-neutral-200 border border-neutral-300/60 shadow-sm transition-all duration-300 origin-bottom-left group-hover:translate-x-1.5 group-hover:-translate-y-1.5 group-hover:rotate-[0.5deg]" />
        </div>

        {/* Main Card Content (White Background) */}
        <div
          className={cn(
            "relative flex flex-col sm:flex-row w-full bg-white rounded-[16px] border overflow-visible transition-colors z-20",
            isMembership ? "border-primary/10 group-hover:border-primary/30" : "border-neutral-200/60 group-hover:border-primary/20"
          )}
        >
          {/* Thumbnail Area */}
          <div className="relative w-full sm:w-[320px] md:w-[400px] shrink-0 aspect-video sm:aspect-auto overflow-hidden bg-neutral-900 border-r border-neutral-100 sm:rounded-l-[16px]">
            <img
              src={thumbnailUrl || "/images/default_series.jpg"}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Content Area */}
          <div className="relative flex flex-1 flex-col p-5 sm:p-6 md:p-8 justify-between gap-4">
            {/* 우측 상단 Kebab 메뉴 (isOwner가 true일 때만 노출) */}
            {isOwner && (
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-30">
                <button
                  onClick={handleMenuClick}
                  className="h-10 w-10 flex items-center justify-center rounded-full text-neutral-300 group-hover:text-neutral-500 hover:!text-neutral-800 hover:bg-neutral-100 transition-colors"
                  aria-label="관리 메뉴"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-10 w-32 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-neutral-100 py-1 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary font-medium transition-colors text-left"
                    >
                      <Pencil className="h-4 w-4" /> 수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium transition-colors text-left"
                    >
                      <Trash2 className="h-4 w-4" /> 삭제
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className={cn(isOwner && "pr-12")}>
              <h3 className="mb-2.5 line-clamp-2 text-xl md:text-2xl font-extrabold leading-snug tracking-tight text-neutral-dark group-hover:text-primary transition-colors">
                {title}
              </h3>

              <p className="line-clamp-2 md:line-clamp-3 text-sm md:text-base leading-relaxed text-neutral-meta">
                {description}
              </p>
            </div>

            {/* Footer Area: 공개여부 · 포스트 개수 (좌) / 업데이트일 (우) */}
            <div className="flex items-center justify-between gap-2 pt-4 mt-auto text-sm font-medium text-neutral-meta">
              <div className="flex items-center gap-2">
                <span className={cn("font-bold", isMembership ? "text-membership" : "text-primary")}>
                  {isMembership ? "멤버십" : "공개"}
                </span>
                <span className="text-neutral-300">·</span>
                <span>{postCount}개의 포스트</span>
              </div>
              <span className="flex items-center gap-1 text-neutral-400">
                업데이트
                <span className="flex items-center gap-1 text-sm font-medium text-neutral-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {updatedAt}
                </span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
