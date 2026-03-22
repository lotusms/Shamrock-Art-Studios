"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { mainNav } from "@/config/nav";

function NavLink({ href, label, onNavigate, className = "" }) {
  const pathname = usePathname();
  const active =
    href === "/" ? pathname === "/" : pathname === href;

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

export default function SiteHeader() {
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-slate-950/75 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-slate-950/65">
      <div className="relative z-[60] mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="font-serif text-lg font-medium tracking-[-0.03em] text-stone-100 transition hover:text-amber-100 sm:text-xl"
          onClick={close}
        >
          Shamrock Art Studio
        </Link>

        <nav
          aria-label="Main"
          className="hidden items-center gap-9 md:flex"
        >
          {mainNav.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] text-stone-100 transition hover:border-amber-400/30 hover:bg-white/[0.07] md:hidden"
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

      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={`fixed inset-0 z-[55] flex flex-col bg-slate-950/97 backdrop-blur-2xl transition-[visibility,opacity] duration-300 md:hidden ${
          open
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-[4.25rem] shrink-0 items-center justify-end px-5">
          <button
            type="button"
            className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-400 transition hover:text-stone-100"
            onClick={close}
          >
            Close
          </button>
        </div>
        <nav
          aria-label="Mobile main"
          className="flex flex-1 flex-col justify-center gap-2 px-8 pb-24"
        >
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="block border-b border-white/[0.06] py-5 font-serif text-3xl font-medium tracking-[-0.02em] text-stone-100 transition first:pt-0 hover:text-amber-100 sm:text-4xl"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
