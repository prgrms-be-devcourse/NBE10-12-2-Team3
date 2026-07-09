import React from "react";
import {notFound} from "next/navigation";
import {BookOpen, Calendar, ChevronRight} from "lucide-react";
import {SeriesDetailPostList} from "./series-detail-post-list";
import {SeriesHeroActions} from "./series-hero-actions";
import {SeriesFollowActions} from "./series-follow-actions";
import {getSeries, getSeriesMedia, getSeriesPosts} from "@/lib/series-api";
import {resolveMediaUrl} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
    const {id} = await params;

    const [series, posts] = await Promise.all([
        getSeries(id),
        getSeriesPosts(id),
    ]).catch(() => notFound());

    let thumbnailUrl = "";
    try {
        const media = await getSeriesMedia(id);
        thumbnailUrl = resolveMediaUrl(media.url);
    } catch {
        // 썸네일 없음
    }

    const mappedPosts = posts.map((p) => ({
        id: p.id,
        title: p.title,
        description: "",
        accessLevel: p.accessLevel as "FREE" | "PAID",
        authorId: series.userId,
        authorName: series.nickname,
        createdAt: p.createdAt ? p.createdAt.split("T")[0] : "",
        viewCount: p.viewCount,
        likeCount: p.likeCount,
        bookmarkCount: p.bookmarkCount,
    }));

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
        {/* 시리즈 히어로 배너 */}
      <div className="w-full bg-neutral-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-neutral-dark to-neutral-dark opacity-80"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-stretch">

          {/* 썸네일 */}
          <div className="w-full md:w-1/4 aspect-video sm:aspect-[4/3] bg-neutral-800 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/10 group">
              <img
                  src={thumbnailUrl || "/images/default_series.jpg"}
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
              <SeriesFollowActions creatorId={series.userId} nickname={series.nickname} />
              <span className="flex items-center gap-1.5 opacity-80">
                <Calendar className="h-4 w-4" />
                업데이트: {series.updatedAt ? series.updatedAt.split("T")[0] : ""}
              </span>
            </div>

              {/* 액션 버튼 */}
            <div className="mt-auto flex justify-center md:justify-start gap-2 md:gap-3">
                <SeriesHeroActions seriesId={id} seriesUserId={series.userId}/>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8">
          {/* 시리즈 소개글 */}
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

        {/* 시리즈 포함 포스트 목록 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SeriesDetailPostList
              posts={mappedPosts}
              totalPosts={mappedPosts.length}
              currentPage={1}
              totalPages={1}
        />
      </div>
    </div>
  );
}
