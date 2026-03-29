"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

function GateEscapeBar() {
  return (
    <div className="pointer-events-auto fixed left-0 right-0 top-0 z-[9999] flex justify-end gap-4 border-b border-white/[0.06] bg-slate-950/95 px-4 py-2 text-xs backdrop-blur-md">
      <Link
        href="/"
        className="font-medium text-amber-200/95 transition hover:text-amber-100"
      >
        Home
      </Link>
      <Link href="/login" className="text-stone-500 transition hover:text-stone-300">
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
        <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-stone-400">
          <p className="text-sm tracking-wide">Loading…</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <GateEscapeBar />
        <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-stone-400">
          <p className="text-sm tracking-wide">Redirecting to login…</p>
        </div>
      </>
    );
  }

  return children;
}
