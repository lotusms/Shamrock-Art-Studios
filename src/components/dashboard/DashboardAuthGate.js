"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

function GateEscapeBar() {
  return (
    <div className="pointer-events-auto fixed left-0 right-0 top-0 z-[9999] flex justify-end gap-4 border-b border-white/10 bg-[#0b0f1a]/95 px-4 py-2 text-xs backdrop-blur-sm">
      <Link href="/" className="text-lime-400/90 hover:text-lime-300">
        Home
      </Link>
      <Link href="/login" className="text-slate-500 hover:text-slate-300">
        Login
      </Link>
    </div>
  );
}

export default function DashboardAuthGate({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <>
        <GateEscapeBar />
        <div className="flex min-h-dvh items-center justify-center bg-[#0b0f1a] text-slate-400">
          <p className="text-sm tracking-wide">Loading…</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <GateEscapeBar />
        <div className="flex min-h-dvh items-center justify-center bg-[#0b0f1a] text-slate-400">
          <p className="text-sm tracking-wide">Redirecting to login…</p>
        </div>
      </>
    );
  }

  return children;
}
