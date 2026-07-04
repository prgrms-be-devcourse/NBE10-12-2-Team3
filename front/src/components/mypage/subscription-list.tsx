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
      // 백엔드는 0-based page index를 사용하므로 page - 1
      const res = await fetch(`/api/subscriptions?page=${page - 1}&size=10`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.content) {
          setItems(json.data.content);
          setTotalPages(json.data.totalPages === 0 ? 1 : json.data.totalPages);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchSubscriptions(currentPage);
    } else {
      setIsLoading(false);
      setItems([]);
    }
  }, [currentPage, isLoggedIn]);

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
