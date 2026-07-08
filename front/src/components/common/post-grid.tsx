import { ContentCard } from "@/components/common/content-card";
import type { PostListResponse } from "@/app/users/[id]/page";

interface PostGridProps {
  posts: PostListResponse[];
  authorName: string;
  emptyMessage?: string;
}

// users/[id](다른 유저 프로필)와 mypage(내 포스트)가 공유하는 포스트 목록 렌더링.
// TODO: 썸네일 API 미제공 — PostListResponse에 thumbnailUrl 필드가 없어 ContentCard가 기본 썸네일로 대체합니다.
// TODO: 포스트 설명은 PostListResponse에 없어 ContentCard에 전달하지 않습니다
// (description은 optional이라 비워두면 빈 값으로 렌더링됩니다).
export function PostGrid({ posts, authorName, emptyMessage = "아직 작성한 포스트가 없습니다." }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white py-24 text-center">
        <p className="text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {posts.map((post) => (
        <ContentCard
          key={post.id}
          id={post.id}
          title={post.title}
          accessLevel={post.accessLevel}
          authorName={authorName}
          createdAt={post.createdAt.split("T")[0]}
          viewCount={post.viewCount}
        />
      ))}
    </div>
  );
}
