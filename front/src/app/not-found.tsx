import Link from "next/link";
import {FileQuestion, Home} from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* 404 숫자 */}
                <div className="relative mb-6 select-none">
                    <span className="text-[120px] sm:text-[160px] font-extrabold text-neutral-100 leading-none">
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FileQuestion className="h-16 w-16 text-primary/60"/>
                    </div>
                </div>

                {/* 메시지 */}
                <h1 className="text-2xl font-extrabold text-neutral-dark mb-3">
                    페이지를 찾을 수 없습니다
                </h1>
                <p className="text-neutral-500 text-sm leading-relaxed mb-8">
                    삭제되었거나 존재하지 않는 페이지입니다.
                    <br/>
                    URL을 다시 확인해 주세요.
                </p>

                {/* 버튼 */}
                <div className="flex justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white px-8 py-3 text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                        <Home className="h-4 w-4"/>
                        홈으로
                    </Link>
                </div>
            </div>
        </div>
    );
}
