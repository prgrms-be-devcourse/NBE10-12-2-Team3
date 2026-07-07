"use client";

import React, {createContext, ReactNode, useContext, useState, useEffect} from "react";
import {apiPost} from "@/lib/api";

export interface User {
  id: number;
  email: string;
  nickname: string;
  avatarUrl?: string;
  role?: "USER" | "ADMIN";
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (userType?: "USER" | "ADMIN") => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  signupWithCredentials: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // 현재 로그인한 유저 정보를 백엔드에서 다시 불러옵니다.
  const refreshUser = async () => {
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        const me = data.data; // UserMeResponse (id, email, profile)
        setUser({
          id: me.id,
          email: me.email,
          nickname: me.profile?.nickname || "",
          role: "USER", // 백엔드 /me 응답에 role이 없으므로 임시 폴백
          avatarUrl: me.profile?.profileImageUrl,
        });
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (e) {
      console.error("User refresh failed", e);
    }
  };

  // 기존 mock login (UI 개발용)
  const login = (userType: "USER" | "ADMIN" = "USER") => {
    setIsLoggedIn(true);
    if (userType === "ADMIN") {
      setUser({ id: 0, email: "admin@scommit.com", nickname: "어드민", role: "ADMIN" });
    } else {
      setUser({ id: 1, email: "dev@scommit.com", nickname: "김도현", role: "USER" });
    }
  };

  // 실제 백엔드 로그인 — JWT 쿠키 세팅 + 유저 상태 동기화
  const loginWithCredentials = async (email: string, password: string) => {
    try {
      await apiPost<{ user: User }>("/api/users/login", { email, password });
      // 로그인 성공 시 쿠키가 세팅되므로, refreshUser를 호출하여 최신 유저 정보를 가져옵니다.
      await refreshUser();
    } catch (e: any) {
      console.error("Login failed:", e);
      throw e;
    }
  };

  // 회원가입 요청
  const signupWithCredentials = async (email: string, password: string, nickname: string) => {
    try {
      await apiPost("/api/users/signup", { email, password, nickname });
    } catch (e: any) {
      console.error("Signup failed:", e);
      throw e;
    }
  };

  const logout = async () => {
    try {
      await apiPost("/api/users/logout");
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // 앱 로드 시 한 번 내 정보 불러오기 시도
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, loginWithCredentials, signupWithCredentials, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
