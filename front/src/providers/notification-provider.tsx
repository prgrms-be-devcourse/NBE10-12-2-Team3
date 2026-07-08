"use client";

import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
import {useAuth} from "@/providers/auth-provider";

export type NotificationType = "NEW_POST" | "COMMENT" | "FOLLOW" | "MEMBERSHIP";

export interface Toast {
    id: string;
    type: NotificationType;
    message: string;
    targetId: number;
}

interface NotificationContextType {
    toasts: Toast[];
    dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const TOAST_DURATION = 5000;

export function NotificationProvider({children}: { children: React.ReactNode }) {
    const {isLoggedIn} = useAuth();
    const [toasts, setToasts] = useState<Toast[]>([]);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // 브라우저는 사용자 인터랙션 없이 오디오 재생을 차단하므로, 첫 클릭/키입력으로 AudioContext를 unlock
    useEffect(() => {
        const unlock = () => {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new AudioContext();
            }
            document.removeEventListener("click", unlock);
            document.removeEventListener("keydown", unlock);
        };
        document.addEventListener("click", unlock);
        document.addEventListener("keydown", unlock);
        return () => {
            document.removeEventListener("click", unlock);
            document.removeEventListener("keydown", unlock);
        };
    }, []);

    const playSound = useCallback(() => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
    }, []);

    useEffect(() => {
        if (!isLoggedIn) return;

        const es = new EventSource("/api/notifications/subscribe", {withCredentials: true});

        // onmessage가 아닌 addEventListener — 백엔드가 .name("notification")으로 보내기 때문
        es.addEventListener("notification", (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data) as {
                    type: NotificationType;
                    message: string;
                    targetId: number;
                };
                const toast: Toast = {
                    id: crypto.randomUUID(),
                    type: data.type,
                    message: data.message,
                    targetId: data.targetId,
                };
                setToasts(prev => [...prev, toast]);
                playSound();
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== toast.id));
                }, TOAST_DURATION);
            } catch {
                // 파싱 실패 무시
            }
        });

        // 로그아웃/언마운트 시 연결 종료 — 안 닫으면 로그아웃 후 3초마다 401 반복
        return () => es.close();
    }, [isLoggedIn, playSound]);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{toasts, dismiss}}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within NotificationProvider");
    }
    return context;
}
