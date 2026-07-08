"use client";

import React from "react";
import Link from "next/link";
import {PenSquare} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/providers/auth-provider";
import {useHasMounted} from "@/hooks/use-has-mounted";

export function SeriesCreateButton() {
    const {user} = useAuth();
    const hasMounted = useHasMounted();
    // hasMounted 가드: 서버는 로그인한 유저를 몰라 항상 null을 렌더링하므로,
    // 하이드레이션 이전엔 user를 그대로 쓰면 서버 HTML과 어긋납니다.
    if (!hasMounted || !user) return null;

    return (
        <Link href="/series/new" prefetch={false}>
            <Button
                className="bg-white text-neutral-900 hover:bg-neutral-200 font-bold rounded-full px-5 py-2.5 shadow-lg transition-all text-sm gap-2">
                <PenSquare className="h-4 w-4"/>
                새 시리즈
            </Button>
        </Link>
    );
}
