import { SeriesListRow } from "@/components/common/series-list-row";
import type { SeriesListResponse } from "@/app/users/[id]/page";

interface SeriesListProps {
  series: SeriesListResponse[];
  isOwner: boolean;
}

// users/[id](다른 유저 프로필)와 mypage(내 시리즈)가 공유하는 시리즈 목록 렌더링.
// 데이터를 어떻게 가져오는지(서버 props vs 클라이언트 self-fetch)는 호출부에서 각자 처리하고,
// 이 컴포넌트는 순수하게 받은 series를 그리는 역할만 합니다.
export function SeriesList({ series, isOwner }: SeriesListProps) {
  if (series.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-24 text-center">
        <p className="text-neutral-500">아직 작성한 시리즈가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {series.map((s) => (
        <SeriesListRow
          key={s.id}
          id={s.id}
          title={s.title}
          description={s.body}
          // TODO: [백엔드 확인 필요] SeriesListResponse에 공개/멤버십 필드가 추가되면 교체
          accessLevel="PUBLIC"
          updatedAt={s.updatedAt.split("T")[0]}
          postCount={s.postCount}
          thumbnailUrl={s.thumbnailUrl}
          isOwner={isOwner}
        />
      ))}
    </div>
  );
}
