import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PostPaginationProps {
  page: number;
  isLastPage: boolean;
  onPageChange: (page: number) => void;
}

// 포스트 탭 전용 페이지네이션. Slice 응답이라 totalPages/totalElements가 없어 "이전/다음" 버튼만 노출합니다.
// "다음"은 isLastPage일 때 비활성화하고, "이전"은 호출부가 직접 추적하는 page 번호로 판단합니다.
export function PostPagination({ page, isLastPage, onPageChange }: PostPaginationProps) {
  if (page <= 1 && isLastPage) return null;

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
        <Button
          variant="outlined"
          aria-label="다음 페이지"
          className={cn(
            "h-10 w-10 rounded-full p-0 flex items-center justify-center transition-all",
            isLastPage
              ? "border-transparent bg-neutral-50 text-neutral-300"
              : "border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
          )}
          disabled={isLastPage}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
