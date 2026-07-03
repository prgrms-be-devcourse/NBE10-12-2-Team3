"use client";

import React, {createContext, ReactNode, useContext, useState} from "react";

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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

    // 기존 mock login (UI 개발용)
  const login = (userType: "USER" | "ADMIN" = "USER") => {
    setIsLoggedIn(true);
    if (userType === "ADMIN") {
        setUser({id: 0, email: "admin@scommit.com", nickname: "어드민", role: "ADMIN"});
    } else {
        setUser({id: 1, email: "dev@scommit.com", nickname: "김도현", role: "USER"});
    }
  };

    // 실제 백엔드 로그인 — JWT 쿠키 세팅 + 유저 상태 동기화
    const loginWithCredentials = async (email: string, password: string) => {
        const res = await fetch("http://localhost:8080/api/users/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({email, password}),
        });

        if (!res.ok) {
            const json = await res.json().catch(() => null);
            throw new Error(json?.msg || "로그인에 실패했습니다.");
        }

        const json = await res.json();
        const profile = json.data.user;

        setIsLoggedIn(true);
        setUser({
            id: profile.id,
            email: profile.email,
            nickname: profile.nickname,
            role: profile.role,
        });
  };

  const logout = () => {
      fetch("http://localhost:8080/api/users/logout", {
          method: "POST",
          credentials: "include",
      }).finally(() => {
          setIsLoggedIn(false);
          setUser(null);
      });
  };

  return (
      <AuthContext.Provider value={{isLoggedIn, user, login, loginWithCredentials, logout}}>
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
