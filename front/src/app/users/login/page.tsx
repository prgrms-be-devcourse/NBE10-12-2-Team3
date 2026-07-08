"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const { loginWithCredentials } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await loginWithCredentials(email, password);
      // 로그인 성공 시 메인 페이지로 이동
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err.message || "로그인에 실패했습니다.");
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
            당신의 성장을 기록하세요.
          </h1>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            현업 개발자들이 쌓아온 노하우를 글로 만나고, 마음에 드는 창작자를
            팔로우하거나 멤버십으로 구독하세요.
          </p>
        </motion.div>
      </div>

      {/* Right: Login Form Area */}
      <div className="flex w-full flex-col justify-center px-6 sm:px-12 lg:w-1/2 xl:px-24">
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
              로그인
            </h2>
            <p className="text-neutral-500">
              환영합니다! 이메일과 비밀번호를 입력해주세요.
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

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
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

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-bold text-neutral-700"
                  htmlFor="password"
                >
                  비밀번호
                </label>
                <Link
                  href="#"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-neutral-600">
            <span>아직 계정이 없으신가요?</span>
            <Link
              href="/users/signup"
              className="font-bold text-primary hover:underline transition-colors"
            >
              회원가입
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
