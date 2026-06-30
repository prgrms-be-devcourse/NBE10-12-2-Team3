"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon, LayoutList, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SeriesEditorClientProps {
  initialData: {
    id: string;
    title: string;
    body: string;
    thumbnailUrl?: string;
    postIds?: string[];
  };
}

export function SeriesEditorClient({ initialData }: SeriesEditorClientProps) {
  const router = useRouter();
  
  const [title, setTitle] = useState(initialData.title);
  const [body, setBody] = useState(initialData.body);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>(initialData.postIds || []);
  const [isSaving, setIsSaving] = useState(false);

  // Pagination for Posts (Mock state)
  const [page, setPage] = useState(0);
  
  // Dummy Data for My Posts
  const allDummyPosts = Array.from({ length: 15 }).map((_, i) => ({
    id: `post-${i + 1}`,
    title: `스프링 부트 실전 가이드 ${i + 1}편: 아키텍처와 트랜잭션 깊이 파보기 (매우 긴 제목 테스트 용도)`,
    createdAt: `2026-06-${(i + 1).toString().padStart(2, '0')}`
  }));

  const myPosts = allDummyPosts.slice(0, (page + 1) * 6);
  const hasMore = myPosts.length < allDummyPosts.length;

  const togglePostSelection = (postId: string) => {
    setSelectedPostIds(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      // TODO: 백엔드 API(SeriesCreateRequest)가 postIds를 받도록 업데이트 되면 주석 해제
      const payload = {
        title,
        body,
        postIds: selectedPostIds,
      };
      
      console.log("저장 요청 페이로드:", payload);
      console.warn("현재 백엔드 스펙은 postIds를 무시합니다. 백엔드에서 @Transactional 작업 완료 시 연동됩니다.");
      
      // await fetch('/api/series', { method: 'POST', body: JSON.stringify(payload) });

      await new Promise(resolve => setTimeout(resolve, 800)); // 모킹 딜레이
      
      const targetId = initialData.id === "new" ? "999" : initialData.id;
      router.push(`/series/${targetId}`);
    } catch (error) {
      console.error(error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("이 시리즈를 정말 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.")) {
      return;
    }
    
    // TODO: 실제 API 연동 (DELETE /api/series/{id})
    alert("시리즈가 성공적으로 삭제되었습니다.");
    router.push("/series");
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <div className="px-6 py-4 sm:py-5 border-b border-neutral-100 flex items-center justify-between bg-white z-10 sticky top-0">
          <h1 className="text-lg sm:text-xl font-extrabold text-neutral-dark flex items-center gap-2">
            <LayoutList className="h-5 w-5 text-primary" />
            {initialData.id === "new" ? "새 시리즈 만들기" : "시리즈 설정 수정"}
          </h1>
          <button 
            onClick={() => router.back()} 
            className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. 배너형 커버 이미지 영역 (최상단) */}
        <div className="w-full h-32 sm:h-40 bg-neutral-100 border-b border-neutral-200 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-neutral-200/50 flex flex-col items-center justify-center z-10 transition-colors group-hover:bg-neutral-200/70">
            <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-400 mb-3" />
            <Button variant="outlined" className="bg-white border-neutral-300 text-neutral-600 text-xs sm:text-sm font-bold shadow-sm h-8 sm:h-9 hover:bg-neutral-50" onClick={() => alert("API 연동 대기중입니다")}>
              이미지 업로드
            </Button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          <div className="space-y-6">
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
              />
            </div>

            {/* 포스트 선택 영역 (반응형 2열 그리드 + 페이징) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-neutral-700">
                  시리즈에 포함할 포스트
                </label>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {selectedPostIds.length}개 선택됨
                </span>
              </div>
              
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl overflow-hidden flex flex-col">
                {myPosts.length === 0 ? (
                  <div className="text-center py-8 text-sm text-neutral-400">
                    아직 작성한 포스트가 없습니다. 포스트를 먼저 작성해주세요.
                  </div>
                ) : (
                  <>
                    <div className="p-4 sm:p-5 max-h-[320px] overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {myPosts.map(post => {
                          const isSelected = selectedPostIds.includes(post.id);
                          return (
                            <label 
                              key={post.id} 
                              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                                isSelected ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-white hover:border-neutral-300'
                              }`}
                            >
                              <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-primary border-primary text-white' : 'border-neutral-300 bg-white'
                              }`}>
                                {isSelected && <Check className="h-3.5 w-3.5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-primary-dark' : 'text-neutral-800'}`} title={post.title}>
                                  {post.title}
                                </p>
                                <p className="text-xs text-neutral-400 mt-1">{post.createdAt}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      
                      {hasMore && (
                        <Button 
                          variant="outlined" 
                          onClick={() => setPage(p => p + 1)} 
                          className="w-full bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100 h-10 font-bold"
                        >
                          더보기 <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 sm:py-5 bg-white border-t border-neutral-200 flex items-center justify-between sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {initialData.id !== "new" ? (
             <Button variant="outlined" onClick={handleDelete} className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 font-bold h-10 sm:h-11 px-4 sm:px-6">
               시리즈 삭제
             </Button>
          ) : <div></div>}
          
          <div className="flex gap-2 sm:gap-3">
            <Button variant="outlined" onClick={() => router.back()} className="h-10 sm:h-11 font-bold text-neutral-600 border-neutral-200 hover:bg-neutral-50 px-4 sm:px-6">
              취소
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !title.trim()} 
              className="h-10 sm:h-11 bg-primary hover:bg-primary/90 text-white font-bold px-6 sm:px-8 shadow-sm transition-transform hover:-translate-y-0.5"
            >
              {isSaving ? "저장 중..." : (initialData.id === "new" ? "생성하기" : "변경사항 저장")}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
