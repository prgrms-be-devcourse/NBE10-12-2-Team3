"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function SeriesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러를 로깅 서비스(Sentry 등)에 보고할 수 있습니다.
    console.error("Series page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-50 p-4 rounded-full">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-neutral-dark mb-2">
          데이터를 불러오지 못했습니다
        </h2>
        
        <p className="text-neutral-500 mb-8 text-sm leading-relaxed">
          일시적인 네트워크 문제이거나 서버에서 응답이 지연되고 있습니다.<br />
          잠시 후 다시 시도해주세요.
        </p>

        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          다시 시도하기
        </button>
      </div>
    </div>
  );
}
