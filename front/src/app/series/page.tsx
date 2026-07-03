import {SeriesViewContainer} from "./series-view-container";
import {SeriesCreateButton} from "./series-create-button";
import {getSeriesList} from "@/lib/series-api";
import {MEDIA_BASE} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function SeriesPage() {
    const data = await getSeriesList(0);

    const initialSeries = data.content.map((s) => ({
        id: s.id,
        userId: s.userId,
        title: s.title,
        body: s.body,
        postCount: s.postCount,
        authorName: s.nickname,
        lastUpdatedAt: s.updatedAt ? s.updatedAt.split("T")[0] : "",
        thumbnailUrl: s.thumbnailUrl ? `${MEDIA_BASE}/${s.thumbnailUrl}` : "",
  }));

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="w-full bg-neutral-dark text-white py-16 px-6 relative overflow-hidden">
          <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-neutral-dark to-neutral-dark opacity-50"/>
          <div className="max-w-7xl mx-auto relative z-10 flex items-end justify-between gap-6">
              <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-300">
                      우리의 지식이 모이는 곳, 시리즈
                  </h1>
                  <p className="text-lg text-neutral-400 max-w-2xl font-medium">
                      개발자들의 깊이 있는 연재물과 튜토리얼을 한곳에서 탐색하세요.
                  </p>
              </div>
              <SeriesCreateButton/>
        </div>
      </div>

        <SeriesViewContainer
            initialSeries={initialSeries}
            initialHasNext={!data.last}
      />
    </div>
  );
}
