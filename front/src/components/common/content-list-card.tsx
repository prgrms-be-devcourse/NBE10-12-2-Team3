import React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Crown, Heart, Eye, Bookmark } from "lucide-react";

interface ContentListCardProps {
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
  className?: string;
}

export function ContentListCard({
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
}: ContentListCardProps) {
  const formattedViews = new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(viewCount);
  const formattedLikes = new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(likeCount);
  const formattedBookmarks = new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(bookmarkCount);

  const isPaid = accessLevel === "PAID";

  return (
    <Link
      href={`/posts/${id}`}
      className={cn(
        "group flex flex-col sm:flex-row overflow-hidden rounded-[16px] bg-white transition-all duration-300 ease-out",
        "border border-neutral-border hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5",
        isPaid && "border-primary/10 hover:border-primary/30",
        className
      )}
    >
      {/* Thumbnail Area */}
      <div className="relative w-full sm:w-[200px] md:w-[240px] shrink-0 aspect-video sm:aspect-auto overflow-hidden bg-neutral-900 border-r border-neutral-100">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <img
            src="/images/default_post.jpg"
            alt="Default thumbnail"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.85]"
            loading="lazy"
          />
        )}

        {/* Access Level Badge */}
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          {isPaid ? (
            <div className="flex items-center gap-1 rounded bg-neutral-900/90 px-2 py-1 backdrop-blur-md shadow-sm">
              <Crown className="h-3 w-3 text-amber-500" />
              <span className="text-[10px] font-bold text-white tracking-wide">MEMBERSHIP</span>
            </div>
          ) : (
            <div className="flex items-center rounded bg-white/95 px-2 py-1 shadow-sm backdrop-blur-md">
              <span className="text-[10px] font-bold text-neutral-dark tracking-wide">FREE</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
             <Avatar name={authorName} className="h-4 w-4" />
             <span className="text-[11px] font-bold text-neutral-dark truncate">{authorName}</span>
          </div>

          <h3 className="mb-1.5 line-clamp-2 text-base font-bold leading-snug tracking-tight text-neutral-dark group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <p className="line-clamp-2 text-[13px] leading-relaxed text-neutral-meta">
            {description}
          </p>
        </div>

        {/* Footer Area: Social Proof */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[12px] font-medium text-neutral-meta">{createdAt}</span>
          <div className="flex items-center gap-3.5">
             <div className="flex items-center gap-1.5 text-neutral-meta">
                <Bookmark className="h-4 w-4" />
                <span className="text-[12px] font-bold">{formattedBookmarks}</span>
             </div>
             <div className="flex items-center gap-1.5 text-neutral-meta">
                <Heart className="h-4 w-4" />
                <span className="text-[12px] font-bold">{formattedLikes}</span>
             </div>
             <div className="flex items-center gap-1.5 text-neutral-meta">
                <Eye className="h-4 w-4" />
                <span className="text-[12px] font-bold">{formattedViews}</span>
             </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
