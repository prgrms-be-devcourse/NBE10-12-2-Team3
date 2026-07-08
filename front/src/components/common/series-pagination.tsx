import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SeriesPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// 시리즈 탭 전용 번호식 페이지네이션. users/[id]와 mypage(내 시리즈)가 동일한 UI를 공유합니다.
export function SeriesPagination({ page, totalPages, onPageChange }: SeriesPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex justify-center">
      <div className="flex items-center gap-1.5">
        <Button
          variant="outlined"
          aria-label="이전 페이지"
          className={cn(
            "h-10 w-10 rounded-full p-0 flex items-center justify-center transition-all",
            page <= 1
              ? "border-transparent bg-neutral-50 text-neutral-300"
              : "border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
          )}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - page) <= 1) {
            return (
              <Button
                key={pageNum}
                variant="outlined"
                className={cn(
                  "h-10 w-10 rounded-full p-0 font-bold transition-all",
                  page === pageNum
                    ? "border-primary text-primary bg-primary/5 shadow-sm"
                    : "border-transparent text-neutral-600 hover:bg-neutral-100"
                )}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          }
          // 항상 1페이지·마지막 페이지·현재 페이지 인접(±1)만 숫자로 보여주고 나머지는 "..."으로 압축합니다.
          if (pageNum === 2 && page > 3) {
            return (
              <span key={pageNum} className="px-1.5 text-neutral-400 flex items-center justify-center h-10">
                ...
              </span>
            );
          }
          if (pageNum === totalPages - 1 && page < totalPages - 2) {
            return (
              <span key={pageNum} className="px-1.5 text-neutral-400 flex items-center justify-center h-10">
                ...
              </span>
            );
          }
          return null;
        })}

        <Button
          variant="outlined"
          aria-label="다음 페이지"
          className={cn(
            "h-10 w-10 rounded-full p-0 flex items-center justify-center transition-all",
            page >= totalPages
              ? "border-transparent bg-neutral-50 text-neutral-300"
              : "border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
          )}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
