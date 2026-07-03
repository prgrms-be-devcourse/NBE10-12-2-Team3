import { notFound } from "next/navigation";
import { MOCK_CREATORS, MOCK_POSTS, MOCK_SERIES } from "@/lib/mock-data";
import { UserProfileView } from "./user-profile-view";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

// Swagger 확정 스펙: GET /api/users/{id} → RsData<UserProfileApiResponse>
export interface UserProfileApiResponse {
  id: number;
  profile: {
    nickname: string;
    profileImageUrl: string;
    introduction: string;
  };
}

// UserProfileApiResponse를 평탄화한 화면용 뷰 모델.
// id/nickname/profileImageUrl/introduction은 UserProfileApiResponse.profile을 그대로 매핑합니다.
// user-profile-view.tsx에서도 이 타입을 그대로 import해서 재사용하므로 별도 타입을 만들지 마세요.
export interface UserProfileResponse {
  id: number;
  nickname: string;
  introduction: string;
  profileImageUrl?: string;
  // TODO: [백엔드 확인 필요] 콘텐츠 수 / 구독자 수 / 구독 중 수 / 멤버십 제공 여부는
  // UserProfileApiResponse에 없습니다. 통계 전용 엔드포인트(예: /users/{userId}/subscriptions/count)가
  // Swagger에 아직 없음 — 백엔드 확인 후 추가 예정.
  contentCount: number;
  subscriberCount: number;
  subscribingCount: number;
  offersMembership: boolean;
}

// Swagger 확정 스펙: GET /api/posts?creatorId={id}&page={n}&size={s} → RsData<SlicePostListResponse>
// body/thumbnail/description 필드가 없어 목록에서는 제목 등 최소 정보만 내려옵니다.
export interface PostListResponse {
  id: number;
  userId: number;
  seriesId: number | null;
  title: string;
  publishStatus: "DRAFT" | "PRIVATE" | "PUBLIC";
  accessLevel: "FREE" | "PAID";
  viewCount: number;
  createdAt: string;
}

// Slice 응답이라 totalPages/totalElements가 없습니다. last로만 "다음 페이지 존재 여부"를 판단합니다.
export interface SlicePostListResponse {
  content: PostListResponse[];
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: unknown;
  sort: unknown;
  size: number;
  number: number;
  empty: boolean;
}

// Swagger 확정 스펙: GET /api/series/users/{userId}?page={n}&size={s} → RsData<PageResponseSeriesListResponse>
export interface SeriesListResponse {
  id: number;
  userId: number;
  nickname: string;
  title: string;
  body: string;
  postCount: number;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 시리즈는 Page 응답이라 totalPages 기반 번호식 페이지네이션을 그대로 사용합니다.
// 필드명은 last가 아니라 isLast입니다.
export interface PageResponseSeriesListResponse {
  content: SeriesListResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
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

  const { data: apiProfile }: { data: UserProfileApiResponse } = await res.json();

  const profile: UserProfileResponse = {
    id: apiProfile.id,
    nickname: apiProfile.profile.nickname,
    introduction: apiProfile.profile.introduction,
    profileImageUrl: apiProfile.profile.profileImageUrl,
    // TODO: [백엔드 확인 필요] 아래 네 필드는 Swagger에 아직 없음 — 백엔드 확인 후 추가 예정
    contentCount: 0,
    subscriberCount: 0,
    subscribingCount: 0,
    offersMembership: false,
  };

  let pagedPosts: PostListResponse[] = [];
  let isLastPostsPage = true;
  let pagedSeries: SeriesListResponse[] = [];
  let totalPages = 1;

  if (tab === "content") {
    // page/size는 개별 쿼리 파라미터로 전달합니다 (Pageable을 nested 객체로 보내지 않음)
    const postsRes = await fetch(
      `http://localhost:8080/api/posts?creatorId=${id}&page=${requestedPage - 1}&size=${PAGE_SIZE}`,
      { cache: "no-store" }
    );

    if (!postsRes.ok) {
      throw new Error("Failed to fetch user posts");
    }

    const { data }: { data: SlicePostListResponse } = await postsRes.json();
    pagedPosts = data.content;
    isLastPostsPage = data.last;
  } else {
    const seriesRes = await fetch(
      `http://localhost:8080/api/series/users/${id}?page=${requestedPage - 1}&size=${PAGE_SIZE}`,
      { cache: "no-store" }
    );

    if (!seriesRes.ok) {
      throw new Error("Failed to fetch user series");
    }

    const { data }: { data: PageResponseSeriesListResponse } = await seriesRes.json();
    pagedSeries = data.content;
    totalPages = data.totalPages;
  }
  */

  // ==== UI 테스트용 임시 더미 데이터 (백엔드 연동 전) ====
  // ⚠️ 위 fetch 블록의 주석을 해제해 실제 API를 사용하게 되면, 이 줄부터 "======="로 끝나는
  // 줄까지의 mock 변환 블록 전체를 삭제하세요. 그대로 두면 profile, totalPages 등의 변수가
  // 위 fetch 블록과 이름이 겹쳐 재선언 컴파일 에러가 발생합니다.
  const creator = MOCK_CREATORS.find((c) => c.id === Number(id));
  if (!creator) return notFound();

  const authoredPosts = MOCK_POSTS.filter((p) => p.authorId === creator.id);
  const authoredSeries = MOCK_SERIES.filter((s) => s.authorId === creator.id);

  const start = (requestedPage - 1) * PAGE_SIZE;

  // 시리즈 탭: 번호식 페이지네이션 유지 (totalPages 기반)
  const totalPages = Math.max(1, Math.ceil(authoredSeries.length / PAGE_SIZE));
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  const seriesStart = (page - 1) * PAGE_SIZE;
  const pagedSeries = tab === "series" ? authoredSeries.slice(seriesStart, seriesStart + PAGE_SIZE) : [];

  // 콘텐츠 탭: Slice 방식 → totalPages 없이 "다음" 버튼만 노출 (last === true면 다음 페이지 없음)
  const pagedPostsMock = tab === "content" ? authoredPosts.slice(start, start + PAGE_SIZE) : [];
  const isLastPostsPage = start + PAGE_SIZE >= authoredPosts.length;
  // MockPost → PostListResponse 형태로 변환. seriesId/publishStatus는 mock에 대응 데이터가 없어
  // UI 확인용으로 임시 고정값을 채웁니다. 실제 연동 시 이 매핑은 삭제됩니다.
  const pagedPosts: PostListResponse[] = pagedPostsMock.map((p) => ({
    id: p.id,
    userId: p.authorId,
    seriesId: null,
    title: p.title,
    publishStatus: "PUBLIC",
    accessLevel: p.accessLevel,
    viewCount: p.viewCount,
    createdAt: p.createdAt,
  }));

  const profile: UserProfileResponse = {
    id: creator.id,
    nickname: creator.nickname,
    introduction: creator.introduction,
    profileImageUrl: creator.profileImageUrl,
    // 탭과 무관하게 게시글(포스트) 수로 고정. 시리즈 수는 별도 통계로 노출하지 않는 의도된 동작입니다.
    // TODO: Slice 응답이라 총 개수를 알 수 없음 — 통계 전용 엔드포인트 확정되면 mock(authoredPosts.length) 대체 예정
    contentCount: authoredPosts.length,
    subscriberCount: creator.subscriberCount,
    subscribingCount: creator.subscribingCount,
    offersMembership: creator.offersMembership,
  };
  // 콘텐츠 탭은 page(URL의 page 파라미터를 그대로 사용, 클램핑 없음 — 프론트가 page 번호를 직접 추적)
  const contentPage = requestedPage;
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
        page={tab === "series" ? page : contentPage}
        totalPages={totalPages}
        isLastPostsPage={isLastPostsPage}
        posts={pagedPosts}
        series={pagedSeries}
      />
    </div>
  );
}
