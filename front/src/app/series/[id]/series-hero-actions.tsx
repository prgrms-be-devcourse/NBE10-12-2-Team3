"use client";

import React from "react";
import Link from "next/link";
import {PenSquare} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/providers/auth-provider";

interface SeriesHeroActionsProps {
    seriesId: string;
    seriesUserId: number;
}

export function SeriesHeroActions({seriesId, seriesUserId}: SeriesHeroActionsProps) {
    const {user} = useAuth();
    const isMySeries = !!user && user.id === seriesUserId;

    if (!isMySeries) return null;

    return (
        <Link href={`/series/${seriesId}/edit`} prefetch={false}>
            <Button
                className="bg-white text-neutral-900 hover:bg-neutral-200 hover:scale-105 font-bold rounded-full px-5 py-4 shadow-lg transition-all text-sm">
                <PenSquare className="h-4 w-4 mr-2"/>
                이 시리즈 수정하기
            </Button>
        </Link>
    );
}
