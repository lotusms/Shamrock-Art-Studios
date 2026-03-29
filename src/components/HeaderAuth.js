"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/**
 * Header account control: Sign in, customer “My Account”, or admin “Portal”.
 * @param {{ onNavigate?: () => void }} props
 */
export default function HeaderAuth({ onNavigate }) {
  const { user, loading, accountLoading, isAdmin } = useAuth();

  if (loading) {
    return (
      <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-slate-600">
        …
      </span>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        onClick={onNavigate}
        className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-stone-200 transition hover:border-amber-400/40 hover:bg-white/[0.1] hover:text-amber-100 sm:px-4"
      >
        Sign in
      </Link>
    );
  }

  if (accountLoading) {
    return (
      <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-slate-600">
        …
      </span>
    );
  }

  if (isAdmin) {
    return (
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="rounded-full border border-amber-400/35 bg-amber-400/10 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber-100 transition hover:border-amber-300/50 hover:bg-amber-400/15 sm:px-4"
      >
        Portal
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      onClick={onNavigate}
      className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-stone-200 transition hover:border-amber-400/40 hover:bg-white/[0.1] hover:text-amber-100 sm:px-4"
    >
      My Account
    </Link>
  );
}
