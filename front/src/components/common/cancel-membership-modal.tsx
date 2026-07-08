"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { ModalOverlay } from "@/components/common/modal-overlay";

interface CancelMembershipModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// 멤버십 해지 확인 팝업. follow-button.tsx(mypage 구독 목록)와 users/[id] 프로필 페이지가
// 문구·디자인을 각자 들고 있지 않도록 여기 하나로 모았습니다.
export function CancelMembershipModal({ open, onConfirm, onCancel }: CancelMembershipModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <ModalOverlay onClose={onCancel}>
          <div className="p-6">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-center text-neutral-900 mb-2">멤버십을 해지하시겠습니까?</h3>
            <p className="text-center text-neutral-500 text-sm mb-6">
              해지 시 일반 팔로워로 전환되며, 현재 누리고 계신 모든 독점 혜택이 즉시 사라집니다. 그래도 진행하시겠습니까?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                유지하기
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-md"
              >
                해지하기
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
}
