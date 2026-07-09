"use client";

import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {FileText, Image as ImageIcon, LayoutList, Loader2, Lock, Minus, Plus, Search, Trash2, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ConfirmDialog} from "@/components/ui/confirm-dialog";
import type {PostListItem} from "@/lib/series-api";
import {
    addPostToSeries,
    createSeries,
    deleteSeries,
    deleteSeriesMedia,
    getMyPosts,
    getSeriesPosts,
    removePostFromSeries,
    updateSeries,
    uploadSeriesMedia
} from "@/lib/series-api";

interface SeriesEditorClientProps {
  initialData: {
    id: string;
    title: string;
    body: string;
    thumbnailUrl?: string;
  };
}

export function SeriesEditorClient({ initialData }: SeriesEditorClientProps) {
  const router = useRouter();
    const isNew = initialData.id === "new";

  const [title, setTitle] = useState(initialData.title);
  const [body, setBody] = useState(initialData.body);
  const [isSaving, setIsSaving] = useState(false);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>(initialData.thumbnailUrl || "");
    const [removeThumbnail, setRemoveThumbnail] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 포스트 피커 상태 (편집 모드에서만)
    const [postsInSeries, setPostsInSeries] = useState<PostListItem[]>([]);
    const [myPosts, setMyPosts] = useState<PostListItem[]>([]);
    const [postsLoading, setPostsLoading] = useState(!isNew);
    const [togglingPostId, setTogglingPostId] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const seriesId = isNew ? null : Number(initialData.id);

    useEffect(() => {
        if (isNew) return;
        Promise.all([
            getSeriesPosts(initialData.id),
            getMyPosts(),
        ]).then(([inSeries, mine]) => {
            setPostsInSeries(inSeries);
            // 이미 이 시리즈에 있는 포스트는 내 포스트 목록에서 제외
            const inSeriesIds = new Set(inSeries.map((p) => p.id));
            setMyPosts(mine.content.filter((p) => !inSeriesIds.has(p.id)));
        }).catch(() => {
        })
            .finally(() => setPostsLoading(false));
    }, [isNew]);

    const handleTogglePost = async (post: PostListItem) => {
        if (!seriesId || togglingPostId !== null) return;
        const isInThisSeries = postsInSeries.some((p) => p.id === post.id);
        setTogglingPostId(post.id);
        try {
            if (isInThisSeries) {
                await removePostFromSeries(seriesId, post.id);
                setPostsInSeries((prev) => prev.filter((p) => p.id !== post.id));
                setMyPosts((prev) => [...prev, {...post, seriesId: null}]);
            } else {
                await addPostToSeries(seriesId, post.id);
                setPostsInSeries((prev) => [...prev, {...post, seriesId}]);
                setMyPosts((prev) => prev.filter((p) => p.id !== post.id));
            }
        } catch {
            alert("변경에 실패했습니다.");
        } finally {
            setTogglingPostId(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
        setRemoveThumbnail(false);
    };

    const handleRemoveThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailPreview("");
        setRemoveThumbnail(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
        let savedSeriesId: number | string;
        if (isNew) {
            const created = await createSeries(title, body);
            savedSeriesId = created.id;
            if (thumbnailFile) {
                await uploadSeriesMedia(savedSeriesId, thumbnailFile);
            }
            // 생성 후 편집 페이지로 이동해 포스트를 추가할 수 있게 함
            router.push(`/series/${savedSeriesId}/edit`);
            return;
        } else {
            await updateSeries(initialData.id, title, body);
            savedSeriesId = initialData.id;
            if (thumbnailFile) {
                await uploadSeriesMedia(savedSeriesId, thumbnailFile);
            } else if (removeThumbnail) {
                try {
                    await deleteSeriesMedia(savedSeriesId);
                } catch { /* 썸네일 없는 경우 무시 */
                }
            }
            router.push(`/series/${savedSeriesId}`);
        }
    } catch {
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
      setIsSaving(true);
      try {
          await deleteSeries(initialData.id);
          router.push("/series");
      } catch {
          alert("삭제에 실패했습니다.");
      } finally {
          setIsSaving(false);
      }
  };

    const [searchQuery, setSearchQuery] = useState("");
    const [showAllAddable, setShowAllAddable] = useState(false);
    const ADDABLE_LIMIT = 10;

    const q = searchQuery.trim().toLowerCase();
    const filteredInSeries = postsInSeries.filter((p) => !q || p.title.toLowerCase().includes(q));
    const postsAddable = myPosts.filter((p) => p.seriesId === null && (!q || p.title.toLowerCase().includes(q)));
    const postsLocked = myPosts.filter((p) => p.seriesId !== null && (!q || p.title.toLowerCase().includes(q)));
    const addableVisible = showAllAddable ? postsAddable : postsAddable.slice(0, ADDABLE_LIMIT);
    const lockedVisible = showAllAddable ? postsLocked : postsLocked.slice(0, Math.max(0, ADDABLE_LIMIT - addableVisible.length));

  return (
      <>
          <ConfirmDialog
              open={showDeleteConfirm}
              title="시리즈를 삭제할까요?"
              description="삭제된 시리즈는 복구할 수 없습니다."
              confirmLabel="삭제"
              destructive
              onConfirm={handleDelete}
              onCancel={() => setShowDeleteConfirm(false)}
          />
    <div className="min-h-screen bg-neutral-50 py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col relative">

        {/* Header */}
        <div className="px-6 py-4 sm:py-5 border-b border-neutral-100 flex items-center justify-between bg-white z-10 sticky top-0">
          <h1 className="text-lg sm:text-xl font-extrabold text-neutral-dark flex items-center gap-2">
            <LayoutList className="h-5 w-5 text-primary" />
              {isNew ? "새 시리즈 만들기" : "시리즈 설정 수정"}
          </h1>
            <button
                onClick={() => router.back()}
            className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

          {/* 썸네일 업로드 영역 */}
          <div
              className="w-full h-40 sm:h-48 bg-neutral-100 border-b border-neutral-200 relative overflow-hidden group">
              {thumbnailPreview ? (
                  <div className="relative w-full h-full">
                      <img
                          src={thumbnailPreview}
                          alt="썸네일 미리보기"
                          className="w-full h-full object-cover"
                      />
                      <div
                          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                              variant="outlined"
                              className="bg-white border-neutral-300 text-neutral-700 text-xs font-bold shadow-sm h-9"
                              onClick={() => fileInputRef.current?.click()}
                          >
                              <ImageIcon className="h-4 w-4 mr-1"/>
                              변경
                          </Button>
                          <Button
                              variant="outlined"
                              className="bg-white border-red-200 text-red-500 text-xs font-bold shadow-sm h-9"
                              onClick={handleRemoveThumbnail}
                          >
                              <Trash2 className="h-4 w-4 mr-1"/>
                              삭제
                          </Button>
                      </div>
                  </div>
              ) : (
                  <div
                      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-200/70 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                  >
                      <ImageIcon className="h-8 w-8 text-neutral-400 mb-3"/>
                      <span className="text-sm font-bold text-neutral-500">클릭하여 썸네일 업로드</span>
                      <span className="text-xs text-neutral-400 mt-1">JPG, PNG, GIF 지원</span>
                  </div>
              )}
              <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
              />
        </div>

        {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-6">
              {/* Title */}
              <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                      시리즈 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="예: 스프링 부트 마이크로서비스 실전"
                      className="w-full px-4 py-3 sm:py-4 rounded-xl border border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-neutral-800 text-lg placeholder:font-normal placeholder:text-neutral-300"
                  />
              </div>

              {/* Description */}
              <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                      간략한 설명
                  </label>
                  <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="이 시리즈에 어떤 포스트들이 담길지 1~2줄로 짧게 요약해주세요."
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-neutral-600 min-h-[100px] resize-y leading-relaxed"
                      rows={3}
                      maxLength={255}
                  />
                  <p className={`text-xs text-right mt-1 ${body.length >= 240 ? "text-red-400" : "text-neutral-400"}`}>
                      {body.length} / 255
                  </p>
              </div>

              {/* 포스트 관리 (편집 모드에서만) */}
              {!isNew && (
                  <div className="pt-2 space-y-4">
                      {/* 헤더 */}
                      <div className="flex items-center justify-between">
                          <h2 className="text-sm font-extrabold text-neutral-800">포스트 관리</h2>
                          {!postsLoading && (
                              <span
                                  className="text-xs font-bold text-neutral-400 bg-neutral-100 rounded-full px-3 py-1">
                    {postsInSeries.length} / {postsInSeries.length + myPosts.length}
                  </span>
                          )}
              </div>

                      {postsLoading ? (
                          <div className="flex items-center justify-center py-10 gap-2 text-neutral-300">
                              <Loader2 className="h-5 w-5 animate-spin"/>
                              <span className="text-xs">불러오는 중...</span>
                          </div>
                      ) : postsInSeries.length === 0 && myPosts.length === 0 ? (
                          <div
                              className="flex flex-col items-center py-8 gap-2 border-2 border-dashed border-neutral-200 rounded-2xl">
                              <FileText className="h-7 w-7 text-neutral-200"/>
                              <p className="text-sm text-neutral-400">작성한 포스트가 없습니다</p>
                          </div>
                      ) : (
                          <>
                              {/* ── 이 시리즈에 포함 ── */}
                              {filteredInSeries.length > 0 && (
                                  <div>
                                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                                          이 시리즈 ({postsInSeries.length})
                                      </p>
                                      <div className="rounded-xl border border-neutral-200 overflow-hidden">
                                          {filteredInSeries.map((post, i) => (
                                              <div key={post.id}
                                                   className="flex items-center gap-3 px-4 py-3 bg-white border-b border-neutral-100 last:border-b-0">
                                                  <span
                                                      className="text-[11px] font-black text-neutral-300 w-4 text-center shrink-0">{i + 1}</span>
                                                  <span
                                                      className="text-sm font-medium text-neutral-800 flex-1 truncate">{post.title}</span>
                                                  <button
                                                      onClick={() => handleTogglePost(post)}
                                                      disabled={togglingPostId === post.id}
                                                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold transition-colors disabled:opacity-40"
                                                  >
                                                      {togglingPostId === post.id
                                                          ? <Loader2 className="h-3 w-3 animate-spin"/>
                                                          : <Minus className="h-3 w-3"/>}
                                                      제거
                                                  </button>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              )}

                              {/* ── 추가 가능 — 리스트 ── */}
                              <div>
                                  {/* 검색 */}
                                  <div className="relative mb-2">
                                      <Search
                                          className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none"/>
                                      <input
                                          value={searchQuery}
                                          onChange={(e) => {
                                              setSearchQuery(e.target.value);
                                              setShowAllAddable(false);
                                          }}
                                          placeholder="추가할 포스트 검색..."
                                          className="w-full pl-8 pr-8 py-2 rounded-lg border border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-xs text-neutral-700 placeholder:text-neutral-400 transition-all"
                                      />
                                      {searchQuery && (
                                          <button
                                              onClick={() => setSearchQuery("")}
                                              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500"
                                          >
                                              <X className="h-3 w-3"/>
                                          </button>
                                      )}
                                  </div>

                                  {/* 리스트 영역 */}
                                  {(addableVisible.length > 0 || lockedVisible.length > 0) ? (
                                      <div
                                          className="max-h-64 overflow-y-auto rounded-xl border border-neutral-200 overflow-hidden">
                                          {/* 추가 가능 */}
                                          {addableVisible.map((post) => (
                                              <div key={post.id}
                                                   className="flex items-center gap-3 px-4 py-3 bg-white border-b border-neutral-100 last:border-b-0">
                                                  <span
                                                      className="text-sm font-medium text-neutral-800 flex-1 truncate">{post.title}</span>
                                                  <button
                                                      onClick={() => handleTogglePost(post)}
                                                      disabled={togglingPostId === post.id}
                                                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold transition-colors disabled:opacity-40"
                                                  >
                                                      {togglingPostId === post.id
                                                          ? <Loader2 className="h-3 w-3 animate-spin"/>
                                                          : <Plus className="h-3 w-3"/>}
                                                      추가
                                                  </button>
                                              </div>
                                          ))}

                                          {/* 다른 시리즈 — 잠금 */}
                                          {lockedVisible.map((post) => (
                                              <div
                                                  key={post.id}
                                                  className="flex items-center gap-3 px-4 py-3 bg-neutral-50 border-b border-neutral-100 last:border-b-0 opacity-50 cursor-not-allowed"
                                                  title="이미 다른 시리즈에 포함된 포스트입니다"
                                              >
                                                  <span
                                                      className="text-sm font-medium text-neutral-400 flex-1 truncate">{post.title}</span>
                                                  <span
                                                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-200 text-neutral-400 text-xs font-bold">
                                                      <Lock className="h-3 w-3"/>
                                                      다른 시리즈
                                                  </span>
                                              </div>
                                          ))}

                                          {/* 더 보기 */}
                                          {!showAllAddable && (postsAddable.length + postsLocked.length > ADDABLE_LIMIT) && (
                                              <button
                                                  onClick={() => setShowAllAddable(true)}
                                                  className="w-full py-2.5 text-xs font-bold text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
                                              >
                                                  {postsAddable.length + postsLocked.length - ADDABLE_LIMIT}개 더 보기
                                              </button>
                                          )}
                                      </div>
                                  ) : (
                                      <div
                                          className="flex flex-col items-center py-6 gap-1 border border-dashed border-neutral-200 rounded-xl">
                                          {q ? (
                                              <>
                                                  <p className="text-xs font-medium text-neutral-400">검색 결과 없음</p>
                                                  <p className="text-[11px] text-neutral-300">&quot;{searchQuery}&quot;와
                                                      일치하는 포스트가 없어요</p>
                                              </>
                                          ) : (
                                              <p className="text-xs text-neutral-400">추가 가능한 포스트가 없습니다</p>
                                          )}
                                      </div>
                                  )}
                              </div>
                          </>
                      )}
                  </div>
              )}

              {isNew && (
                  <div
                      className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5">
                      <FileText className="h-4 w-4 text-neutral-400 shrink-0"/>
                      <p className="text-xs text-neutral-500">시리즈 생성 후 포스트를 추가할 수 있습니다.</p>
                  </div>
              )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 sm:py-5 bg-white border-t border-neutral-200 flex items-center justify-between sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {!isNew ? (
                <Button
                    variant="outlined"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 font-bold h-10 sm:h-11 px-4 sm:px-6"
                >
                    시리즈 삭제
                </Button>
            ) : (
                <div/>
            )}

          <div className="flex gap-2 sm:gap-3">
              <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  className="h-10 sm:h-11 font-bold text-neutral-600 border-neutral-200 hover:bg-neutral-50 px-4 sm:px-6"
              >
              취소
            </Button>
              <Button
                  onClick={handleSave}
                  disabled={isSaving || !title.trim()}
              className="h-10 sm:h-11 bg-primary hover:bg-primary/90 text-white font-bold px-6 sm:px-8 shadow-sm transition-transform hover:-translate-y-0.5"
            >
                  {isSaving ? "저장 중..." : isNew ? "생성하기" : "변경사항 저장"}
            </Button>
          </div>
        </div>
      </div>
    </div>
      </>
  );
}
