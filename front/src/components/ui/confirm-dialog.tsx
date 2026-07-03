"use client";

import {useEffect} from "react";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
                                  open,
                                  title,
                                  description,
                                  confirmLabel = "확인",
                                  cancelLabel = "취소",
                                  destructive = false,
                                  onConfirm,
                                  onCancel,
                              }: ConfirmDialogProps) {
    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
            if (e.key === "Enter") onConfirm();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, onCancel, onConfirm]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onCancel}
        >
            {/* 배경 오버레이 */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>

            {/* 다이얼로그 */}
            <div
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-base font-bold text-neutral-dark mb-2">{title}</h2>
                {description && (
                    <p className="text-sm text-neutral-500 mb-6">{description}</p>
                )}
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                            destructive
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-primary hover:bg-primary/90"
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
