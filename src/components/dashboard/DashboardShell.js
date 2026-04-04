"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  RiDashboardLine,
  RiLockLine,
  RiSettings3Line,
  RiShoppingBag3Line,
} from "react-icons/ri";
import { useAuth } from "@/context/AuthContext";
import InnerPageBackdrop from "@/components/InnerPageBackdrop";
import { orgName } from "@/config";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import * as dash from "@/lib/dashboardChrome";
import { isLightThemeId } from "@/theme";

const GRAIN_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const navItems = [
  { href: "/dashboard", label: "Dashboard", Icon: RiDashboardLine },
  { href: "/dashboard/orders", label: "Orders", Icon: RiShoppingBag3Line },
  { href: "/dashboard/settings", label: "Settings", Icon: RiSettings3Line },
  { href: "/dashboard/change-password", label: "Password", Icon: RiLockLine },
];

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
  const { user, signOut, userAccount } = useAuth();

  const welcomeName = useMemo(() => {
    if (userAccount.status !== "ready") return "";
    const first = String(userAccount.firstName ?? "").trim();
    const last = String(userAccount.lastName ?? "").trim();
    const full = [first, last].filter(Boolean).join(" ");
    if (full) return full;
    const dn = String(user?.displayName ?? "").trim();
    if (dn) return dn;
    return "there";
  }, [userAccount, user?.displayName]);

  return (
    <div className={dash.dashboardRoot(light)}>
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-0 mix-blend-overlay ${light ? "opacity-[0.03]" : "opacity-[0.04]"}`}
        style={{ backgroundImage: GRAIN_BG }}
      />
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        <InnerPageBackdrop light={light} />
      </div>

      <aside className={dash.dashboardAside(light)}>
        <p className={dash.dashboardNavLabel(light)}>Navigation</p>
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
                className={dash.dashboardNavLink(light, active)}
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
        <header className={dash.dashboardHeader(light)}>
          <Link href="/" className={dash.dashboardBrandLink(light)}>
            {orgName}
          </Link>
          <div className="flex items-center gap-4">
            <span className={dash.dashboardWelcome(light)}>
              Welcome{" "}
              <span className={dash.dashboardWelcomeName(light)}>
                {welcomeName || "…"}
              </span>
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

        <main className={dash.dashboardMain(light)}>{children}</main>
      </div>
    </div>
  );
}
