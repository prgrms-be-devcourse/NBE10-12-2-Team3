import { SeriesCardSkeleton } from "@/components/common/series-card-skeleton";
import { Loader2 } from "lucide-react";

export default function SeriesLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* 정적 시각 배너 영역 */}
      <div className="w-full bg-neutral-dark text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-neutral-dark to-neutral-dark opacity-50"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            우리의 지식이 모이는 곳, 시리즈
          </h1>
          <p className="text-lg text-neutral-300 max-w-2xl">
            개발자들의 깊이 있는 연재물과 튜토리얼을 한곳에서 탐색하세요.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* 컨트롤 바 영역 스켈레톤 */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
          <div className="flex gap-4">
            <div className="h-8 w-24 bg-neutral-200 animate-pulse rounded-md"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-24 bg-neutral-200 animate-pulse rounded-md hidden md:block"></div>
            <div className="h-8 w-20 bg-neutral-200 animate-pulse rounded-md"></div>
          </div>
        </div>

        {/* 로딩 인디케이터 */}
        <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p className="text-sm font-medium">시리즈 목록을 불러오는 중입니다...</p>
        </div>

        {/* 리스트 스켈레톤 (그리드로 고정 표시) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-full">
               <SeriesCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
