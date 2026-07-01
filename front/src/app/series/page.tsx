import {SeriesViewContainer} from "./series-view-container";

export const dynamic = "force-dynamic";

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  
  // TODO: 실제 백엔드 연동 시 아래 주석 해제 및 활용
  /*
  const res = await fetch(`http://localhost:8080/api/v1/series?page=${page - 1}&size=10`, {
    cache: "no-store"
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch series data");
  }
  
  const data = await res.json();
  
  // 백엔드 의존성 결함 체크 (totalPages 누락 시 강제 에러 발생)
  if (data.totalPages === undefined) {
    throw new Error("API 명세 오류: PageResponse에 totalPages 필드가 누락되었습니다.");
  }
  
  const { content: seriesList, totalPages } = data;
  */

  // ==== UI 테스트용 임시 더미 데이터 (백엔드 연동 전) ====
  // 이 부분은 백엔드 API 연동 시 삭제하시면 됩니다.
  const mockSeriesList = Array.from({ length: 10 }).map((_, i) => ({
    id: i + (page - 1) * 10,
    title: `실무 밀착형 아키텍처 설계 패턴 ${i + 1 + (page - 1) * 10}편`,
    body: "실제 프로덕션 환경에서 마주하는 다양한 병목 현상을 해결하기 위한 데이터베이스 튜닝과 아키텍처 설계 노하우를 깊이 있게 파헤칩니다.",
    postCount: (i * 3) % 20 + 1, // Deterministic mock data instead of Math.random
    authorName: "시니어개발자",
    lastUpdatedAt: "2026-06-29",
    thumbnailUrl: "", // 빈 문자열로 두면 SeriesCard에서 범용 <img>의 fallback 작동
  }));

  const mockTotalPages = 15; // 전체 15페이지로 가정
  // =======================================================

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 최상단 정적 시각 배너 */}
      <div className="w-full bg-neutral-dark text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-neutral-dark to-neutral-dark opacity-50"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-300">
            우리의 지식이 모이는 곳, 시리즈
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl font-medium">
            개발자들의 깊이 있는 연재물과 튜토리얼을 한곳에서 탐색하세요.
          </p>
        </div>
      </div>

      <SeriesViewContainer 
        seriesList={mockSeriesList} 
        currentPage={page} 
        totalPages={mockTotalPages} 
      />
    </div>
  );
}
