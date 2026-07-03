import { notFound } from "next/navigation";
import { MOCK_CREATORS, MOCK_POSTS, MOCK_SERIES } from "@/lib/mock-data";
import { UserProfileView } from "./user-profile-view";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

// TODO: [백엔드 연동] GET /api/users/{id} 응답 형태가 확정되면 아래 fetch 코드와 mock 변환 로직이
// 이 타입을 함께 참조하도록 유지해서, 필드명이 어긋나면 컴파일 타임에 잡히게 합니다.
// user-profile-view.tsx에서도 이 타입을 그대로 import해서 재사용하므로 별도 타입을 만들지 마세요.
export interface UserProfileResponse {
  id: number;
  nickname: string;
  introduction: string;
  profileImageUrl?: string;
  contentCount: number;
  subscriberCount: number;
  subscribingCount: number;
  offersMembership: boolean;
}

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const tab = resolvedSearchParams.tab === "series" ? "series" : "content";

  const parsedPage = parseInt(resolvedSearchParams.page || "1", 10);
  const requestedPage = Number.isNaN(parsedPage) ? 1 : parsedPage;

  // TODO: 실제 백엔드 연동 시 아래 주석 해제 및 활용
  /*
  const res = await fetch(`http://localhost:8080/api/users/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error("Failed to fetch user profile");
  }

  const profile: UserProfileResponse = await res.json();

  const listRes = await fetch(
    `http://localhost:8080/api/users/${id}/${tab === "series" ? "series" : "posts"}?page=${requestedPage - 1}&size=${PAGE_SIZE}`,
    { cache: "no-store" }
  );

  if (!listRes.ok) {
    throw new Error("Failed to fetch user content");
  }

  const listData = await listRes.json();
  const { content: items, totalPages } = listData;
  */

  // ==== UI 테스트용 임시 더미 데이터 (백엔드 연동 전) ====
  // ⚠️ 위 fetch 블록의 주석을 해제해 실제 API를 사용하게 되면, 이 줄부터 "======="로 끝나는
  // 줄까지의 mock 변환 블록 전체를 삭제하세요. 그대로 두면 profile, totalPages 등의 변수가
  // 위 fetch 블록과 이름이 겹쳐 재선언 컴파일 에러가 발생합니다.
  const creator = MOCK_CREATORS.find((c) => c.id === Number(id));
  if (!creator) return notFound();

  const authoredPosts = MOCK_POSTS.filter((p) => p.authorId === creator.id);
  const authoredSeries = MOCK_SERIES.filter((s) => s.authorId === creator.id);

  const activeList = tab === "series" ? authoredSeries : authoredPosts;
  const totalPages = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE));
  // 요청된 page 값을 1 ~ totalPages 범위로 클램핑 (NaN은 위에서 이미 1로 폴백)
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const pagedPosts = tab === "content" ? authoredPosts.slice(start, start + PAGE_SIZE) : [];
  const pagedSeries = tab === "series" ? authoredSeries.slice(start, start + PAGE_SIZE) : [];

  const profile: UserProfileResponse = {
    id: creator.id,
    nickname: creator.nickname,
    introduction: creator.introduction,
    profileImageUrl: creator.profileImageUrl,
    // 탭과 무관하게 게시글(포스트) 수로 고정. 시리즈 수는 별도 통계로 노출하지 않는 의도된 동작입니다.
    contentCount: authoredPosts.length,
    subscriberCount: creator.subscriberCount,
    subscribingCount: creator.subscribingCount,
    offersMembership: creator.offersMembership,
  };
  // =======================================================

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* 최상단 정적 시각 배너 (series/page.tsx와 동일한 스타일) */}
      <div className="w-full h-40 sm:h-48 bg-neutral-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-neutral-dark to-neutral-dark opacity-50" />
      </div>

      <UserProfileView
        profile={profile}
        tab={tab}
        page={page}
        totalPages={totalPages}
        posts={pagedPosts}
        series={pagedSeries}
      />
    </div>
  );
}
