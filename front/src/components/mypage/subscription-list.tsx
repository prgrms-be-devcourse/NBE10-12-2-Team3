"use client";

import React, { useState, useEffect } from "react";
import { CreatorCard } from "@/components/common/creator-card";
import { ChevronLeft, ChevronRight, Inbox, Loader2 } from "lucide-react";
import { FollowTier } from "@/components/common/follow-button";
import { useAuth } from "@/providers/auth-provider";

interface SubscriptionItem {
  creatorId: number;
  nickname: string;
  creatorProfileImage: string | null;
  tier: FollowTier;
}

export function SubscriptionList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  const fetchSubscriptions = async (page: number) => {
    setIsLoading(true);
    try {
      // 🚨 [임시 테스트용 더미 데이터] 실제 백엔드 연동 전 UI 확인을 위한 가짜 데이터입니다.
      setTimeout(() => {
        const dummyData: SubscriptionItem[] = [
          { creatorId: 101, nickname: "토스 테크", creatorProfileImage: null, tier: "FOLLOW" },
          { creatorId: 102, nickname: "우아한 형제들 기술블로그", creatorProfileImage: null, tier: "MEMBERSHIP" },
          { creatorId: 103, nickname: "카카오 엔터프라이즈", creatorProfileImage: null, tier: "FOLLOW" },
          { creatorId: 104, nickname: "당근마켓 팀", creatorProfileImage: null, tier: "FOLLOW" },
          { creatorId: 105, nickname: "네이버 D2", creatorProfileImage: null, tier: "MEMBERSHIP" },
          { creatorId: 106, nickname: "라인 엔지니어링", creatorProfileImage: null, tier: "FOLLOW" },
        ];
        
        // 페이지네이션 테스트를 위해 3개씩 잘라서 보여줍니다.
        const start = (page - 1) * 3;
        const end = start + 3;
        
        setItems(dummyData.slice(start, end));
        setTotalPages(Math.ceil(dummyData.length / 3));
        setIsLoading(false);
      }, 500); // 0.5초 로딩 효과
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 테스트를 위해 로그인 여부와 상관없이 항상 더미 데이터를 불러오도록 수정
    fetchSubscriptions(currentPage);
  }, [currentPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <Inbox className="h-8 w-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-bold text-neutral-dark mb-2">아직 구독한 창작자가 없습니다</h3>
        <p className="text-sm text-neutral-500">관심 있는 창작자를 찾아서 구독해보세요!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((creator) => (
          <CreatorCard
            key={creator.creatorId}
            id={creator.creatorId}
            nickname={creator.nickname}
            // API 응답에 없는 필드들은 기본값 처리
            subscriberCount={0}
            introduction="창작자님의 멋진 공간입니다."
            initialTier={creator.tier || "FOLLOW"}
          />
        ))}
      </div>

      {/* Pagination Control */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1;
              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                    isActive 
                      ? "bg-primary text-white shadow-md" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
