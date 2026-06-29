"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

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
  login: (userType?: "USER" | "ADMIN") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // TODO: [백엔드 연동] 추후 /api/users/login API 호출 및 토큰 관리 로직으로 교체해야 합니다.
  const login = (userType: "USER" | "ADMIN" = "USER") => {
    setIsLoggedIn(true);
    if (userType === "ADMIN") {
      setUser({
        id: 0,
        email: "admin@scommit.com",
        nickname: "어드민",
        role: "ADMIN",
      });
    } else {
      setUser({
        id: 1,
        email: "dev@scommit.com",
        nickname: "김도현",
        role: "USER",
      });
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
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
