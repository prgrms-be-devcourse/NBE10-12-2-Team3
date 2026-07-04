"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // 1. 현재 로그인한 유저 정보를 백엔드에서 다시 불러옵니다. (Current 장점)
  const refreshUser = async () => {
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        const userData = data.data.user;
        setUser({
          id: userData.id,
          email: userData.email,
          nickname: userData.nickname,
          role: userData.role,
          avatarUrl: data.data.profileImageUrl,
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

  // 2. 기존 mock login (UI 개발용)
  const login = (userType: "USER" | "ADMIN" = "USER") => {
    setIsLoggedIn(true);
    if (userType === "ADMIN") {
        setUser({id: 0, email: "admin@scommit.com", nickname: "어드민", role: "ADMIN"});
    } else {
        setUser({id: 1, email: "dev@scommit.com", nickname: "김도현", role: "USER"});
    }
  };

  // 3. 실제 백엔드 로그인 — 프록시 연동 추가 (Incoming 장점 + Current 프록시 혼합)
  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.msg || json?.message || "로그인에 실패했습니다.");
      }

      await refreshUser();
    } catch (e: any) {
      console.error("Login failed:", e);
      throw e;
    }
  };

  // 4. 로그아웃 비동기 처리
  const logout = async () => {
    try {
      await fetch("/api/users/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    setIsLoggedIn(false);
    setUser(null);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        loginWithCredentials,
        logout,
        refreshUser,
      }}
    >
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
