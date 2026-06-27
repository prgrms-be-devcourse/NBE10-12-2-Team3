"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Settings, User, Shield, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function DevTools() {
  const { isLoggedIn, user, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // 프로덕션 환경에서는 완전히 렌더링되지 않음 (Tree-shaking)
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[999] flex flex-col items-end gap-2 font-sans">
      {isOpen && (
        <div className="flex w-64 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white/90 shadow-xl backdrop-blur-xl transition-all duration-200 animate-in slide-in-from-bottom-2">
          <div className="border-b border-neutral-100 bg-neutral-50/50 px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5" />
              Developer Tools
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", isLoggedIn ? "bg-emerald-500" : "bg-neutral-300")} />
              <span className="text-sm font-medium text-neutral-dark">
                {isLoggedIn ? `Logged in as ${user?.nickname}` : "Guest Mode"}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col p-1.5">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => login("USER")}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                >
                  <User className="h-4 w-4" />
                  일반 유저 모의 로그인
                </button>
                <button
                  onClick={() => login("ADMIN")}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700"
                >
                  <Shield className="h-4 w-4" />
                  어드민 모의 로그인
                </button>
              </>
            ) : (
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </button>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-transform hover:scale-105 active:scale-95",
          isOpen && "bg-primary"
        )}
      >
        {isOpen ? <ChevronDown className="h-6 w-6" /> : <Settings className="h-6 w-6" />}
      </button>
    </div>
  );
}
