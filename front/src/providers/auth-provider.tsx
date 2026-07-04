"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// TODO: [백엔드 연동] 실제 백엔드 연동 시 User 인터페이스는 공통 타입 파일로 분리하고 필드를 확장해야 합니다.
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
  login: (userType?: "USER" | "ADMIN") => Promise<void>;
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

  const login = async () => {
    // TODO: 실제 백엔드 연동 전까지 빈 함수로 남겨둡니다. 
    // 실제 로그인 구현 시 여기에 로직 추가
    console.log("Login method placeholder");
  };

  const logout = async () => {
    try {
      await fetch("/api/users/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    setIsLoggedIn(false);
    setUser(null);
  };

  // 앱 로드 시 한 번 내 정보 불러오기 시도
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, refreshUser }}>
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
