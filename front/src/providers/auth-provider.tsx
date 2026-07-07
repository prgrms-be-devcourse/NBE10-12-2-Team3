"use client";

import React, {createContext, ReactNode, useContext, useState, useEffect} from "react";
import {apiFetch, apiPost, ApiError} from "@/lib/api";

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
      const userData = await apiFetch<{
        id: number;
        email: string;
        role?: "USER" | "ADMIN";
        profile?: { nickname: string; profileImageUrl?: string };
      }>("/api/users/me");
      setUser({
        id: userData.id,
        email: userData.email,
        nickname: userData.profile?.nickname ?? "",
        role: userData.role,
        avatarUrl: userData.profile?.profileImageUrl,
      });
      setIsLoggedIn(true);
    } catch (e) {
      if (!(e instanceof ApiError)) {
        console.error("User refresh failed", e);
      }
      setIsLoggedIn(false);
      setUser(null);
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

  const logout = async () => {
      await apiPost("/api/users/logout").catch(() => {}).finally(() => {
          setIsLoggedIn(false);
          setUser(null);
      });
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
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
