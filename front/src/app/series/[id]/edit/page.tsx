import { SeriesEditorClient } from "./series-editor-client";

export const dynamic = "force-dynamic";

export default async function SeriesEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15+ 대응: params 비동기 처리
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // TODO: 실제 백엔드 연동 시 아래 주석 해제 (상세 조회 후 에디터에 주입)
  /*
  const res = await fetch(`http://localhost:8080/api/v1/series/${id}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch series data for edit");
  }
  const data = await res.json();
  const series = data.data; // SeriesResponse (id, title, body 등)
  */

  // ==== 임시 더미 데이터 ====
  const mockSeries = {
    id,
    title: "실무 밀착형 아키텍처 설계 패턴", // 기존에 작성된 제목이라 가정
    body: "실제 프로덕션 환경에서 마주하는 다양한 병목 현상을 해결하기 위한 데이터베이스 튜닝과 아키텍처 설계 노하우를 깊이 있게 파헤칩니다.",
    postIds: ["post-2", "post-4"], // 기존에 포함되어 있던 포스트들
  };
  // ===============================================

  return <SeriesEditorClient initialData={mockSeries} />;
}
