import React from "react";
import Link from "next/link";
import { PenSquare, Calendar, ChevronRight, Heart, Share2, UserPlus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeriesDetailPostList } from "./series-detail-post-list";

export const dynamic = "force-dynamic";

export default async function SeriesDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1", 10);

  // TODO: 실제 API 연동 (GET /api/series/{id}?page={page-1}&size=12)
  const isMySeries = true; // TODO: 권한 체크 로직 연동 시 교체

  // 더미 데이터
  const series = {
    id,
    title: "실무 밀착형 아키텍처 설계 패턴",
    body: "실제 프로덕션 환경에서 마주하는 다양한 병목 현상을 해결하기 위한 데이터베이스 튜닝과 아키텍처 설계 노하우를 깊이 있게 파헤칩니다.\n\n이 시리즈에서는 다음과 같은 내용을 다룹니다:\n1. 대용량 트래픽 처리 전략\n2. 인덱스 최적화와 쿼리 튜닝\n3. 마이크로서비스 아키텍처 전환기\n\n매주 월요일 새로운 포스트가 업로드됩니다.",
    authorName: "시니어개발자",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-29",
    thumbnailUrl: "",
  };

  // 백엔드에 아직 없는 '연관 게시글 목록' 더미 데이터 (10개씩 페이징)
  const totalPosts = 42; // 총 42개의 포스트라 가정
  const totalPages = Math.ceil(totalPosts / 10);
  const itemsCount = page === totalPages ? (totalPosts % 10 === 0 ? 10 : totalPosts % 10) : 10; 
  
  const mockPosts = Array.from({ length: itemsCount }).map((_, i) => {
    const descendingIndex = totalPosts - ((page - 1) * 10 + i);
    return {
      id: `post-${descendingIndex}`,
      title: `아키텍처 설계 패턴 ${descendingIndex}장: 핵심 전략과 실전 도입`,
      description: "본격적인 아키텍처 설계에 앞서 알아야 할 필수 개념들을 정리합니다. 가장 중요한 것은 요구사항 분석입니다.",
      accessLevel: descendingIndex % 3 === 0 ? "PAID" : "FREE" as "FREE" | "PAID",
      authorName: series.authorName,
      createdAt: "2026-06-29",
      viewCount: 1520 + descendingIndex * 100,
      thumbnailUrl: "",
    };
  });

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* 1. 시리즈 히어로 (배너) 영역 - 이건 기존 너비(max-w-4xl) 유지하여 집중도 확보 */}
      <div className="w-full bg-neutral-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-neutral-dark to-neutral-dark opacity-80"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-stretch">
          
          {/* 썸네일 */}
          <div className="w-full md:w-1/4 aspect-video sm:aspect-[4/3] bg-neutral-800 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/10 group">
            <img 
              src={series.thumbnailUrl || "/images/default_series.jpg"} 
              alt={series.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          </div>

          {/* 메타데이터 */}
          <div className="flex-1 flex flex-col justify-center w-full text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-primary-light font-bold text-xs sm:text-sm mb-3 tracking-wider opacity-90">
              <span>SERIES</span>
              <ChevronRight className="h-4 w-4" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight mb-5 leading-snug md:leading-tight">
              {series.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs md:text-sm font-medium text-neutral-300 mb-6">
              <button className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/5 shadow-sm hover:bg-white/20 transition-colors group">
                <span className="text-white font-bold">{series.authorName}</span>
                <UserPlus className="h-3.5 w-3.5 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" />
              </button>
              <span className="flex items-center gap-1.5 opacity-80">
                <Calendar className="h-4 w-4" />
                업데이트: {series.updatedAt}
              </span>
            </div>

            {/* 액션 버튼 그룹 */}
            <div className="mt-auto flex justify-center md:justify-start gap-2 md:gap-3">
              {isMySeries ? (
                <Link href={`/series/${id}/edit`} prefetch={false}>
                  <Button className="bg-white text-neutral-900 hover:bg-neutral-200 hover:scale-105 font-bold rounded-full px-5 py-4 shadow-lg transition-all text-sm">
                    <PenSquare className="h-4 w-4 mr-2" />
                    이 시리즈 수정하기
                  </Button>
                </Link>
              ) : (
                <>
                  <Button className="bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 font-bold rounded-full px-5 py-4 shadow-lg shadow-primary/20 transition-all text-sm">
                    <Heart className="h-4 w-4 mr-2" />
                    시리즈 추천하기
                  </Button>
                  <Button className="bg-white/10 text-white hover:bg-white/20 hover:-translate-y-0.5 font-bold rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-lg transition-all border border-white/10">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8">
        {/* 2. 시리즈 소개글 (Body) - 이것도 max-w-4xl 유지 */}
        <section className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-neutral-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
          <h2 className="text-lg font-extrabold text-neutral-dark mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3">
            <BookOpen className="h-4 w-4 text-primary" />
            시리즈 소개
          </h2>
          <div className="prose prose-neutral max-w-none text-neutral-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
            {series.body || <span className="text-neutral-400 italic">소개글이 없습니다.</span>}
          </div>
        </section>
      </div>

      {/* 3. 시리즈 포함 게시글 목록 (목업) - 여기서부터 max-w-7xl로 대폭 확장 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SeriesDetailPostList 
          posts={mockPosts}
          totalPosts={totalPosts}
          currentPage={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
