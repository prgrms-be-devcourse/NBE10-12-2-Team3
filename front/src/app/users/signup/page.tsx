"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const { signupWithCredentials } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // 1. 프론트엔드 자체 유효성 검사 (백엔드 DTO 검증 규칙과 100% 매칭)
    if (!email || !nickname || !password || !passwordConfirm) {
      setErrorMsg("모든 필드를 입력해주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("올바른 이메일 형식이 아닙니다.");
      return;
    }

    if (nickname.length < 2 || nickname.length > 20) {
      setErrorMsg("닉네임은 최소 2자에서 최대 20자 사이여야 합니다.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 2. 백엔드 가입 요청
    setIsLoading(true);

    try {
      await signupWithCredentials(email, password, nickname);
      // 회원가입 성공 시 로그인 페이지로 이동하면서 쿼리 파라미터로 성공 메시지를 줄 수 있음
      alert("회원가입에 성공했습니다! 로그인 페이지로 이동합니다.");
      router.push("/users/login");
    } catch (err: any) {
      setErrorMsg(err.message || "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left: Brand / Hero Area (Split 5:5) */}
      <div className="relative hidden w-1/2 flex-col justify-center overflow-hidden bg-primary px-12 lg:flex">
        {/* Decorative Background Gradients */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-black/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10"
        >
          <Link href="/" className="mb-10 inline-block">
            <div className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-[10px] overflow-hidden bg-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/images/app-icon.jpg"
                  alt="SCommit Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-2xl font-black text-white tracking-wide">
                SCOMMIT
              </span>
            </div>
          </Link>

          <h1 className="mb-6 text-4xl font-bold leading-snug text-white">
            1일 1커밋의 기적,
            <br />
            새로운 여정을 시작하세요.
          </h1>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            현업 개발자들이 쌓아온 노하우를 글로 만나고, 마음에 드는 창작자를 팔로우하거나 멤버십으로 구독하세요.
          </p>
        </motion.div>
      </div>

      {/* Right: Signup Form Area */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 xl:px-24">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg overflow-hidden shadow-sm">
                <img
                  src="/images/app-icon.jpg"
                  alt="SCommit Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xl font-black text-neutral-dark">
                SCOMMIT
              </span>
            </Link>
          </div>

          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-bold text-neutral-dark">
              회원가입
            </h2>
            <p className="text-neutral-500">
              SCOMMIT에 가입하고 매일 성장하는 즐거움을 누려보세요.
            </p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl bg-red-50 p-4 border border-red-100"
            >
              <p className="text-sm font-semibold text-red-600">{errorMsg}</p>
            </motion.div>
          )}

          <form onSubmit={handleSignup} className="flex flex-col gap-5">
            {/* 이메일 */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-bold text-neutral-700"
                htmlFor="email"
              >
                이메일
              </label>
              <Input
                id="email"
                type="email"
                placeholder="dev@scommit.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-neutral-200 bg-neutral-50 px-4 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* 닉네임 */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-bold text-neutral-700"
                htmlFor="nickname"
              >
                닉네임
              </label>
              <Input
                id="nickname"
                type="text"
                placeholder="홍길동 (2자~20자)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="h-12 rounded-xl border-neutral-200 bg-neutral-50 px-4 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-bold text-neutral-700"
                htmlFor="password"
              >
                비밀번호
              </label>
              <Input
                id="password"
                type="password"
                placeholder="최소 8자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-neutral-200 bg-neutral-50 px-4 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-bold text-neutral-700"
                htmlFor="passwordConfirm"
              >
                비밀번호 확인
              </label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="비밀번호를 한 번 더 입력해주세요"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="h-12 rounded-xl border-neutral-200 bg-neutral-50 px-4 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-4 h-12 w-full rounded-xl text-[15px] font-bold shadow-md transition-transform active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  가입하는 중...
                </>
              ) : (
                "회원가입"
              )}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-neutral-600">
            <span>이미 계정이 있으신가요?</span>
            <Link
              href="/users/login"
              className="font-bold text-primary hover:underline transition-colors"
            >
              로그인
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
