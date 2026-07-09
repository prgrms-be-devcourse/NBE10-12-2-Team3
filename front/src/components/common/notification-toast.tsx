"use client";

import React from "react";
import {useRouter} from "next/navigation";
import {FileText, MessageSquare, Star, UserPlus, X} from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";
import {type NotificationType, type Toast, TOAST_DURATION, useNotifications} from "@/providers/notification-provider";

const TYPE_STYLE: Record<NotificationType, { icon: React.ReactNode; iconBg: string; bar: string; label: string }> = {
    NEW_POST: {
        icon: <FileText className="h-4 w-4"/>,
        iconBg: "bg-blue-100 text-blue-600",
        bar: "bg-blue-400",
        label: "새 게시글"
    },
    COMMENT: {
        icon: <MessageSquare className="h-4 w-4"/>,
        iconBg: "bg-green-100 text-green-600",
        bar: "bg-green-400",
        label: "댓글"
    },
    FOLLOW: {
        icon: <UserPlus className="h-4 w-4"/>,
        iconBg: "bg-purple-100 text-purple-600",
        bar: "bg-purple-400",
        label: "팔로우"
    },
    MEMBERSHIP: {
        icon: <Star className="h-4 w-4"/>,
        iconBg: "bg-amber-100 text-amber-600",
        bar: "bg-amber-400",
        label: "멤버십"
    },
};

function getTarget(type: NotificationType, targetId: number): string {
    switch (type) {
        case "NEW_POST":
        case "COMMENT":
            return `/posts/${targetId}`;
        case "FOLLOW":
        case "MEMBERSHIP":
            return `/users/${targetId}`;
    }
}

function NotificationToast({toast, onDismiss}: { toast: Toast; onDismiss: () => void }) {
    const router = useRouter();
    const style = TYPE_STYLE[toast.type];

    const handleNavigate = () => {
        router.push(getTarget(toast.type, toast.targetId));
        onDismiss();
    };

    return (
        <motion.div
            layout
            initial={{opacity: 0, x: 80, scale: 0.95}}
            animate={{opacity: 1, x: 0, scale: 1}}
            exit={{opacity: 0, x: 80, scale: 0.95}}
            transition={{type: "spring", stiffness: 400, damping: 30}}
            className="w-80 rounded-2xl border border-neutral-200/60 bg-white shadow-2xl overflow-hidden"
        >
            <div className="flex items-start gap-3 p-4">
                <div
                    className={`mt-0.5 shrink-0 flex h-7 w-7 items-center justify-center rounded-full ${style.iconBg}`}>
                    {style.icon}
                </div>

                {/* 클릭 영역: 알림 내용 → 해당 페이지 이동 */}
                <div
                    className="flex-1 min-w-0 cursor-pointer rounded-lg px-1 -mx-1 hover:bg-neutral-50 transition-colors"
                    onClick={handleNavigate}
                >
                    <p className="text-xs font-semibold text-neutral-400 mb-0.5">{style.label}</p>
                    <p className="text-sm text-neutral-800 leading-snug">{toast.message}</p>
                </div>

                {/* 수동 닫기 버튼 */}
                <button
                    onClick={onDismiss}
                    className="shrink-0 p-0.5 text-neutral-400 hover:text-neutral-700 transition-colors"
                    aria-label="알림 닫기"
                >
                    <X className="h-3.5 w-3.5"/>
                </button>
            </div>

            {/* 자동 닫힘 타이머 바 — 타입별 색상으로 카운트다운 시각화 */}
            <motion.div
                initial={{scaleX: 1}}
                animate={{scaleX: 0}}
                transition={{duration: TOAST_DURATION / 1000, ease: "linear"}}
                className={`h-0.5 ${style.bar} origin-left`}
            />
        </motion.div>
    );
}

export function NotificationToastContainer() {
    const {toasts, dismiss} = useNotifications();

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <NotificationToast toast={toast} onDismiss={() => dismiss(toast.id)}/>
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
