"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useCart } from "@/context/CartContext";
import { mainNav } from "@/config/nav";

const GRAIN_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

function isActivePath(pathname, href, prefix) {
  if (prefix) return pathname === href || pathname.startsWith(`${href}/`);
  if (href === "/") return pathname === "/";
  return pathname === href;
}

function NavLink({ href, label, prefix, onNavigate, className = "" }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href, prefix);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group relative py-1 text-[0.7rem] font-medium uppercase tracking-[0.35em] transition-colors ${className} ${
        active ? "text-amber-200" : "text-stone-400 hover:text-stone-100"
      }`}
    >
      <span className="relative z-10">{label}</span>
      <span
        className={`absolute -bottom-0.5 left-0 h-px bg-linear-to-r from-amber-400/80 to-amber-200/40 transition-all duration-300 ${
          active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
        }`}
        aria-hidden
      />
    </Link>
  );
}

function CartNavLink({ onNavigate }) {
  const { itemCount } = useCart();
  return (
    <Link
      href="/cart"
      onClick={() => onNavigate?.()}
      className="group relative flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-stone-300 transition hover:border-amber-400/35 hover:bg-white/[0.07] hover:text-stone-100"
      aria-label={`Shopping cart${itemCount ? `, ${itemCount} items` : ""}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-5 w-5"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
      </svg>
      {itemCount > 0 ? (
        <span className="min-w-[1.25rem] rounded-full bg-amber-400/90 px-1.5 text-center text-[0.65rem] font-bold tabular-nums text-slate-950">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[110] border-b border-white/[0.06] bg-slate-950/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-slate-950/70">
        <div className="relative z-[120] mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="min-w-0 font-serif text-base font-medium tracking-[-0.03em] text-stone-100 transition hover:text-amber-100 sm:text-xl"
            onClick={close}
          >
            <span className="block truncate">Shamrock Art Studio</span>
          </Link>

          <nav
            aria-label="Main"
            className="hidden items-center gap-9 md:flex"
          >
            {mainNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                prefix={item.prefix}
              />
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <CartNavLink onNavigate={close} />
            <button
              type="button"
              className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] text-stone-100 transition hover:border-amber-400/35 hover:bg-white/[0.1] md:hidden"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span
                className={`h-0.5 w-5 origin-center rounded-full bg-current transition-transform duration-300 ${
                  open ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`h-0.5 w-5 rounded-full bg-current transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`h-0.5 w-5 origin-center rounded-full bg-current transition-transform duration-300 ${
                  open ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Outside <header>: `backdrop-filter` on header traps `position:fixed` descendants — full-screen menu would only paint under the bar on mobile. */}
      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!open}
        className={`mobile-nav-panel fixed inset-0 z-[100] flex h-full min-h-[100dvh] flex-col md:hidden ${open ? "mobile-nav-panel--open" : ""} transition-[visibility,opacity] duration-300 ease-out ${
          open
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-slate-950"
          aria-hidden
        />

        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute -left-[20%] -top-[10%] h-[min(90vw,28rem)] w-[min(90vw,28rem)] rounded-full bg-slate-500/30 blur-[90px]" />
          <div className="absolute -right-[15%] bottom-[-20%] h-[min(110vw,32rem)] w-[min(110vw,32rem)] rounded-full bg-amber-400/18 blur-[100px]" />
          <div className="absolute left-[40%] top-[35%] h-48 w-48 rounded-full bg-sky-400/12 blur-[64px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-400/35 to-transparent" />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-overlay"
          style={{ backgroundImage: GRAIN_BG }}
        />

        <div className="relative z-10 flex h-full min-h-[100dvh] flex-1 flex-col pt-[max(4.25rem,env(safe-area-inset-top))]">
          <div className="flex shrink-0 items-end justify-between gap-4 border-b border-white/10 px-6 pb-5 pt-2">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.45em] text-slate-500">
                Navigate
              </p>
              <p className="mt-1 font-serif text-2xl font-medium tracking-[-0.02em] text-stone-100">
                Menu
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-stone-200 transition hover:border-amber-400/40 hover:bg-white/[0.1] hover:text-amber-100"
              onClick={close}
            >
              Close
            </button>
          </div>

          <nav
            aria-label="Mobile main"
            className="flex flex-1 flex-col justify-center gap-0 px-2 sm:px-6"
          >
            {mainNav.map((item, i) => {
              const active = isActivePath(pathname, item.href, item.prefix);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  style={{
                    animationDelay: open ? `${70 + i * 55}ms` : "0ms",
                  }}
                  className={`mobile-nav-item group relative flex items-center gap-5 border-b border-white/[0.07] py-5 pl-4 pr-2 transition-colors sm:gap-8 sm:py-6 ${
                    active
                      ? "bg-white/[0.04] text-amber-100"
                      : "text-stone-200 hover:bg-white/[0.03] hover:text-stone-50"
                  }`}
                >
                  <span
                    className={`w-8 shrink-0 font-mono text-[0.7rem] tabular-nums tracking-widest sm:w-10 sm:text-xs ${
                      active ? "text-amber-400/90" : "text-slate-500"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 font-serif text-[clamp(1.75rem,6vw,2.75rem)] font-medium leading-none tracking-[-0.03em]">
                    {item.label}
                  </span>
                  <span
                    className={`ml-auto text-lg text-amber-400/50 transition group-hover:translate-x-0.5 group-hover:text-amber-300/80 ${
                      active ? "text-amber-300/90" : ""
                    }`}
                    aria-hidden
                  >
                    →
                  </span>
                  {active ? (
                    <span
                      className="absolute bottom-5 left-0 top-5 w-0.5 rounded-full bg-linear-to-b from-amber-400 to-amber-600/50 sm:bottom-6 sm:top-6"
                      aria-hidden
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 space-y-4 border-t border-amber-400/15 bg-slate-900/70 px-6 py-6 backdrop-blur-sm">
            <Link
              href="/cart"
              onClick={close}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-4 transition hover:border-amber-400/30 hover:bg-slate-900/80"
            >
              <span className="text-sm font-medium uppercase tracking-[0.2em] text-stone-300">
                Cart
              </span>
              <span className="text-amber-200/90">View bag →</span>
            </Link>
            <p className="text-center text-[0.65rem] uppercase tracking-[0.35em] text-slate-600">
              Shamrock Art Studio
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
