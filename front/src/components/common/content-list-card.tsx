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
      <div className="relative w-full sm:w-[320px] md:w-[400px] shrink-0 aspect-video sm:aspect-auto overflow-hidden bg-neutral-900 border-r border-neutral-100">
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

        {/* Bottom Left: Premium Indicator (Netflix / YouTube vibe) */}
        <div className="absolute bottom-3 left-3 z-20">
          {isPaid ? (
             <div className="flex items-center gap-1.5 rounded-full bg-black/85 px-3 py-1.5 backdrop-blur-md border border-white/40 shadow-lg shadow-black/40">
               <Crown className="h-3.5 w-3.5 text-amber-400" />
               <span className="text-xs font-bold text-white">멤버십 전용</span>
             </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 backdrop-blur-md border border-black/20 shadow-lg shadow-black/20">
               <span className="text-xs font-bold text-primary">전체 공개</span>
             </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-5 sm:p-6 md:p-8 justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
             <Avatar name={authorName} className="h-5 w-5" />
             <span className="text-xs font-bold text-neutral-dark truncate">{authorName}</span>
          </div>

          <h3 className="mb-2.5 line-clamp-2 text-xl md:text-2xl font-extrabold leading-snug tracking-tight text-neutral-dark group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <p className="line-clamp-2 md:line-clamp-3 text-sm md:text-base leading-relaxed text-neutral-meta">
            {description}
          </p>
        </div>

        {/* Footer Area: Social Proof */}
        <div className="flex items-center justify-between pt-4 mt-auto">
          <span className="text-sm font-medium text-neutral-meta">{createdAt}</span>
          <div className="flex items-center gap-5">
             <div className="flex items-center gap-2 text-neutral-meta">
                <Bookmark className="h-4 w-4" />
                <span className="text-sm font-bold">{formattedBookmarks}</span>
             </div>
             <div className="flex items-center gap-2 text-neutral-meta">
                <Heart className="h-4 w-4" />
                <span className="text-sm font-bold">{formattedLikes}</span>
             </div>
             <div className="flex items-center gap-2 text-neutral-meta">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-bold">{formattedViews}</span>
             </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
