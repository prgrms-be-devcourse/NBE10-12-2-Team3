"use client";

import React, {createContext, ReactNode, useContext, useState, useEffect} from "react";
import {apiFetch, apiPost, ApiError, resolveMediaUrl} from "@/lib/api";

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
  // 앱 최초 마운트 시의 로그인 여부 확인이 끝났는지 여부입니다. user는 "로그인 안 함"과
  // "아직 확인 중"을 둘 다 null로 표현해 구분이 안 되므로, 화면에서 확인 중/미로그인을
  // 구분해서 보여줘야 할 때(예: 스켈레톤) 이 값을 사용하세요. refreshUser()를 이후에
  // 다시 호출해도(예: 프로필 저장 후) 이 값은 재확인 중이라고 바뀌지 않습니다 — 오직
  // 앱이 처음 켜졌을 때 한 번만 true → false로 바뀝니다.
  isAuthLoading: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  signupWithCredentials: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 현재 로그인한 유저 정보를 백엔드에서 다시 불러옵니다.
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
        // 로컬(dev) 프로필에서는 이 URL이 "user/abc123.jpg" 같은 상대 경로로 내려오는데,
        // resolveMediaUrl 없이 그대로 쓰면 이미지가 404나서 Avatar가 계속 깨진 상태로 남습니다.
        avatarUrl: userData.profile?.profileImageUrl ? resolveMediaUrl(userData.profile.profileImageUrl) : undefined,
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
    await apiPost("/api/users/login", { email, password });

    // 로그인 응답(LoginResponse.LoginProfile)에는 프로필 이미지가 없어서, 로그인 직후
    // avatarUrl이 빈 상태로 남는 문제가 있었습니다. /api/users/me를 다시 불러와
    // 프로필 이미지를 포함한 최신 정보로 채웁니다.
    // TODO: [로그인 화면 PR에서 확인] 로그인(POST) 자체는 성공했는데 바로 이어지는
    // refreshUser()의 /api/users/me 호출만 일시적으로 실패하면, refreshUser 내부 catch가
    // isLoggedIn을 다시 false로 돌려버려 "로그인 성공했지만 화면은 비로그인 상태"인
    // 엣지케이스가 생길 수 있습니다. 로그인 응답의 유저 정보로 우선 상태를 세팅하고
    // refreshUser()는 avatarUrl 보강용으로만 쓰는 방식으로 분리하는 걸 고려해보세요.
    await refreshUser();
  };

  // 회원가입 요청
  const signupWithCredentials = async (email: string, password: string, nickname: string) => {
    await apiPost("/api/users/signup", { email, password, nickname });
  };

  const logout = async () => {
    await apiPost("/api/users/logout").catch(() => {}).finally(() => {
      setIsLoggedIn(false);
      setUser(null);
    });
  };

  useEffect(() => {
    let ignore = false;

    async function checkInitialAuth() {
      await refreshUser();
      if (!ignore) setIsAuthLoading(false);
    }

    checkInitialAuth();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        isAuthLoading,
        loginWithCredentials,
        signupWithCredentials,
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
