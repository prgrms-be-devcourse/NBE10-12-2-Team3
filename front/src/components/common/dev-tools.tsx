"use client";

import React, {useState} from "react";
import {useAuth} from "@/providers/auth-provider";
import {ChevronDown, LogIn, LogOut, Settings, Shield, User} from "lucide-react";
import {cn} from "@/lib/utils";

export function DevTools() {
    const {isLoggedIn, user, loginWithCredentials, logout} = useAuth();
  const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

    const handleRealLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await loginWithCredentials(email, password);
            setEmail("");
            setPassword("");
            setIsOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "로그인 실패");
        } finally {
            setLoading(false);
        }
    };

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
                {isLoggedIn ? `${user?.nickname} (${user?.role})` : "Guest Mode"}
              </span>
            </div>
          </div>

          <div className="flex flex-col p-1.5">
            {!isLoggedIn ? (
              <>
                  {/* 실제 백엔드 로그인 */}
                  <form onSubmit={handleRealLogin} className="px-2 py-2 space-y-2 border-b border-neutral-100 mb-1">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">실제 로그인 (JWT)</p>
                      <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="이메일"
                          required
                          className="w-full rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs outline-none focus:border-neutral-900"
                      />
                      <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="비밀번호"
                          required
                          className="w-full rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs outline-none focus:border-neutral-900"
                      />
                      {error && <p className="text-[11px] text-red-500">{error}</p>}
                      <button
                          type="submit"
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-1.5 rounded-md bg-neutral-900 text-white text-xs font-bold py-1.5 hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                      >
                          <LogIn className="h-3.5 w-3.5"/>
                          {loading ? "로그인 중..." : "로그인"}
                      </button>
                  </form>

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
