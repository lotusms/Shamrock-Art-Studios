"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "◆" },
  { href: "/dashboard/orders", label: "Orders", icon: "◇" },
  { href: "/dashboard/settings", label: "Settings", icon: "○" },
];

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const displayName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Admin";

  return (
    <div className="flex min-h-dvh bg-[#0b0f1a] text-slate-100">
      <aside className="flex w-56 shrink-0 flex-col border-r border-white/[0.06] bg-[#070b14] px-4 py-8">
        <p className="mb-6 px-3 text-[0.65rem] font-medium uppercase tracking-[0.35em] text-slate-600">
          Navigation
        </p>
        <nav className="flex flex-col gap-1" aria-label="Dashboard">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-lime-400 text-slate-950"
                    : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                }`}
              >
                <span className="text-xs opacity-80" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0b0f1a] px-8">
          <Link
            href="/"
            className="font-serif text-lg font-semibold tracking-tight text-stone-100"
          >
            Shamrock Art Studio
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              Welcome{" "}
              <span className="font-medium text-slate-200">{displayName}</span>
              !
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-lime-300"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto bg-[#0d1220] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
