"use client";

import React, { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  // 생략 시 ESC/배경 클릭으로 닫히지 않는 alert 용도로 동작합니다.
  onCancel?: () => void;
}

export function ConfirmModal({ title, description, confirmLabel = "확인", onConfirm, onCancel }: ConfirmModalProps) {
  const titleId = useId();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmButtonRef.current?.focus();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => onCancel?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="mb-2 text-lg font-extrabold text-neutral-900">{title}</h2>
        {description && (
          <p className="mb-6 text-sm text-neutral-500">{description}</p>
        )}
        <Button ref={confirmButtonRef} type="button" variant="filled" onClick={onConfirm} className="w-full">
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
