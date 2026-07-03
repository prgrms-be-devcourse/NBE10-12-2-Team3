"use client";

import React from "react";
import Link from "next/link";
import {PenSquare} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/providers/auth-provider";

export function SeriesCreateButton() {
    const {user} = useAuth();
    if (!user) return null;

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
