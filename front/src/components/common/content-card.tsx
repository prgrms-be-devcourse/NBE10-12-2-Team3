import React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Crown, Heart, Eye, Bookmark } from "lucide-react";

interface ContentCardProps {
  id: string | number;
  title: string;
  description: string;
  accessLevel: "FREE" | "PAID";
  thumbnailUrl?: string;
  authorName: string;
  createdAt: string;
  viewCount: number;
  likeCount?: number;
  bookmarkCount?: number;
  membershipPrice?: number; // Added to support YouTube Membership style pricing
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
  className,
  href,
  onClick,
}: ContentCardProps) {
  const formattedViews = new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(viewCount);
  const formattedLikes = new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(likeCount);
  const formattedBookmarks = new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(bookmarkCount);

  const isPaid = accessLevel === "PAID";

  return (
    <Link
      href={href || `/posts/${id}`}
      onClick={onClick}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[16px] bg-white transition-all duration-300 ease-out",
        "border border-neutral-border hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5",
        // 유료 콘텐츠일 경우 미세한 프리미엄 테두리 및 그림자 효과 추가
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

        {/* Bottom Left: Premium Indicator (Netflix / YouTube vibe) */}
        <div className="absolute bottom-3 left-3 z-20">
          {isPaid ? (
             <div className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 backdrop-blur-md border border-white/10 shadow-lg">
               <Crown className="h-3.5 w-3.5 text-amber-400" />
               <span className="text-xs font-bold text-white">멤버십 전용</span>
             </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-md shadow-lg">
               <span className="text-xs font-bold text-primary">전체 공개</span>
             </div>
          )}
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
             <div className="flex items-center gap-1 text-neutral-meta">
                <Bookmark className="h-3.5 w-3.5" />
                <span className="text-[11px] font-bold">{formattedBookmarks}</span>
             </div>
             <div className="flex items-center gap-1 text-neutral-meta">
                <Heart className="h-3.5 w-3.5" />
                <span className="text-[11px] font-bold">{formattedLikes}</span>
             </div>
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
