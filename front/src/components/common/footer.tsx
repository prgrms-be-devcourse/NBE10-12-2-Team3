import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-neutral-200/50 bg-white/70 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8 xl:px-12">
      <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-[5px] overflow-hidden border border-neutral-800/10 shadow-sm">
            <img 
              src="/images/app-icon.jpg" 
              alt="SCommit Icon" 
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-black tracking-normal text-neutral-dark select-none text-[11px]">COMMIT</span>
        </div>
        <span className="hidden sm:inline">&copy; {new Date().getFullYear()} All rights reserved.</span>
      </div>
      <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
        <Link href="/" className="hover:text-primary transition-colors">이용약관</Link>
        <Link href="/" className="font-bold text-neutral-700 hover:text-primary transition-colors">개인정보처리방침</Link>
        <Link href="/" className="hidden sm:inline hover:text-primary transition-colors">고객센터</Link>
      </div>
    </footer>
  );
}
