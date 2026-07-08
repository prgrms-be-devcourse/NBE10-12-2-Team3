import React from "react";
import Link from "next/link";
import {Avatar} from "@/components/ui/avatar";
import {cn} from "@/lib/utils";
import {Bookmark, Eye, Heart} from "lucide-react";
import {formatCompact} from "@/lib/format";
import {AccessBadge} from "@/components/common/access-badge";

interface ContentCardProps {
  id: string | number;
  title: string;
  description?: string;
  accessLevel: "FREE" | "PAID";
  thumbnailUrl?: string;
  authorName: string;
  createdAt: string;
  viewCount: number;
  likeCount?: number;
  bookmarkCount?: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    onLike?: () => void;
    onBookmark?: () => void;
    membershipPrice?: number;
  className?: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function ContentCard({
  id,
  title,
  description,
  accessLevel,
  thumbnailUrl,
  authorName,
  createdAt,
  viewCount,
  likeCount = 0,
  bookmarkCount = 0,
                                isLiked = false,
                                isBookmarked = false,
                                onLike,
                                onBookmark,
  className,
  href,
  onClick,
}: ContentCardProps) {
  const formattedViews = formatCompact(viewCount);
  const formattedLikes = formatCompact(likeCount);
  const formattedBookmarks = formatCompact(bookmarkCount);

  const isPaid = accessLevel === "PAID";

  return (
    <Link
      href={href || `/posts/${id}`}
      onClick={onClick}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[16px] bg-white transition-all duration-300 ease-out",
        "border border-neutral-border hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5",
        // 유료 포스트일 경우 미세한 프리미엄 테두리 및 그림자 효과 추가
        isPaid && "border-primary/10 hover:border-primary/30",
        className
      )}
    >
      {/* Thumbnail Area (Cinematic ratio) */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <img
            src="/images/default_post.jpg"
            alt="Default thumbnail"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 brightness-[0.85]"
          />
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/10 pointer-events-none" />

        {/* Bottom Left: Premium Indicator */}
        <div className="absolute bottom-3 left-3 z-20">
          <AccessBadge accessLevel={accessLevel} />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
           <div className="flex items-center gap-2">
             <Avatar name={authorName || "User"} className="h-5 w-5" />
             <span className="text-xs font-bold text-neutral-dark truncate max-w-[100px]">{authorName || "알 수 없는 사용자"}</span>
           </div>
        </div>

        <h3 className="mb-2 line-clamp-2 text-base font-bold leading-snug tracking-tight text-neutral-dark group-hover:text-primary transition-colors">
          {title}
        </h3>

        <p className="line-clamp-2 text-[13px] leading-relaxed text-neutral-meta flex-1">
          {description}
        </p>

        {/* Footer Area: Social Proof */}
        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
          <span className="text-[11px] font-medium text-neutral-meta">{createdAt}</span>
          <div className="flex items-center gap-3">
              <button
                  onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onBookmark?.();
                  }}
                  className={cn(
                      "flex items-center gap-1 transition-colors",
                      isBookmarked ? "text-primary" : "text-neutral-meta hover:text-primary"
                  )}
              >
                  <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-primary")}/>
                  <span className="text-[11px] font-bold">{formattedBookmarks}</span>
              </button>
              <button
                  onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onLike?.();
                  }}
                  className={cn(
                      "flex items-center gap-1 transition-colors",
                      isLiked ? "text-red-500" : "text-neutral-meta hover:text-red-400"
                  )}
              >
                  <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-red-500")}/>
                  <span className="text-[11px] font-bold">{formattedLikes}</span>
              </button>
             <div className="flex items-center gap-1 text-neutral-meta">
                <Eye className="h-3.5 w-3.5" />
                <span className="text-[11px] font-bold">{formattedViews}</span>
             </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
