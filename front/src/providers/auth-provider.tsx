"use client";

import React, {createContext, ReactNode, useContext, useState} from "react";
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
        const {user: profile} = await apiPost<{ user: User }>("/api/users/login", {email, password});

        setIsLoggedIn(true);
        setUser({
            id: profile.id,
            email: profile.email,
            nickname: profile.nickname,
            role: profile.role,
        });
  };

  const logout = () => {
      apiPost("/api/users/logout").catch(() => {}).finally(() => {
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
