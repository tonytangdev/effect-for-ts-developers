"use client";

import Link from "next/link";
import { useState } from "react";
import { useProgress } from "./progress-provider";
import { Sidebar } from "./sidebar";

export function Header() {
  const { progress } = useProgress();
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      <header className="border-b border-border sticky top-0 bg-bg z-50 px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="no-underline">
            <h1 className="font-serif text-xl sm:text-[22px] font-bold m-0 tracking-tight text-text-heading">
              Effect TS
            </h1>
            <p className="text-[11px] text-text-muted mt-0.5 tracking-[2px] uppercase">
              A course for TypeScript developers
            </p>
          </Link>
          <button
            onClick={() => setShowSidebar(true)}
            className="bg-bg-elevated border border-border text-text px-3 py-1.5 text-[11px] cursor-pointer font-mono hover:border-accent-dark transition-colors"
          >
            {progress}% done
          </button>
        </div>
        <div className="mt-3 h-0.5 bg-bg-elevated relative">
          <div
            className="h-full bg-gradient-to-r from-accent-dark to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>
      <Sidebar open={showSidebar} onClose={() => setShowSidebar(false)} />
    </>
  );
}
