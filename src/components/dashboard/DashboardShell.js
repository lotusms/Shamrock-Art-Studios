"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiDashboardLine,
  RiSettings3Line,
  RiShoppingBag3Line,
} from "react-icons/ri";
import { useAuth } from "@/context/AuthContext";
import InnerPageBackdrop from "@/components/InnerPageBackdrop";

const GRAIN_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const navItems = [
  { href: "/dashboard", label: "Dashboard", Icon: RiDashboardLine },
  { href: "/dashboard/orders", label: "Orders", Icon: RiShoppingBag3Line },
  { href: "/dashboard/settings", label: "Settings", Icon: RiSettings3Line },
];

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const displayName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Admin";

  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-slate-950 text-stone-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_BG }}
      />
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        <InnerPageBackdrop />
      </div>

      <aside className="relative z-10 flex w-[4.25rem] shrink-0 flex-col border-r border-white/[0.06] bg-slate-950/85 px-2 py-6 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/75 lg:w-56 lg:px-4 lg:py-8">
        <p className="mb-4 hidden px-3 text-[0.65rem] font-medium uppercase tracking-[0.35em] text-slate-500 lg:mb-6 lg:block">
          Navigation
        </p>
        <nav className="flex flex-col gap-1" aria-label="Dashboard">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.Icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                className={`flex items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition lg:justify-start lg:px-3 ${
                  active
                    ? "bg-amber-400/12 text-amber-100 ring-1 ring-amber-400/25"
                    : "text-stone-400 hover:bg-white/[0.04] hover:text-stone-100"
                }`}
              >
                <Icon
                  className="size-[1.35rem] shrink-0 opacity-90"
                  aria-hidden
                />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] bg-slate-950/80 px-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-slate-950/70 sm:px-8">
          <Link
            href="/"
            className="font-serif text-lg font-medium tracking-[-0.03em] text-stone-100 transition hover:text-amber-100"
          >
            Shamrock Art Studio
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-stone-400 sm:inline">
              Welcome{" "}
              <span className="font-medium text-stone-200">{displayName}</span>
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-full bg-linear-to-br from-amber-100 via-stone-100 to-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/35 ring-2 ring-white/30 transition hover:scale-[1.02] hover:shadow-xl"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="relative min-h-0 flex-1 overflow-auto bg-slate-950/40 p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
