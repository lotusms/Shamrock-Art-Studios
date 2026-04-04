"use client";

import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import { isLightThemeId } from "@/theme";

export default function ContactEmailCta() {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
  return (
    <a
      href="mailto:studio@shamrockartstudio.com"
      className={
        light
          ? "group inline-flex w-fit flex-col gap-1 rounded-2xl border-2 border-stone-300/55 bg-white/85 px-6 py-5 shadow-lg shadow-stone-400/20 transition hover:border-amber-400/45 hover:bg-amber-50/50"
          : "group inline-flex w-fit flex-col gap-1 rounded-2xl border-2 border-slate-600/45 bg-slate-900/50 px-6 py-5 shadow-lg shadow-slate-950/35 transition hover:border-amber-400/35 hover:bg-slate-800/50"
      }
    >
      <span
        className={
          light
            ? "text-xs uppercase tracking-[0.28em] text-stone-600"
            : "text-xs uppercase tracking-[0.28em] text-site-secondary"
        }
      >
        Write
      </span>
      <span
        className={
          light
            ? "font-serif text-2xl font-medium tracking-[-0.02em] text-stone-900 transition group-hover:text-sky-800 sm:text-3xl"
            : "font-serif text-2xl font-medium tracking-[-0.02em] text-site-fg transition group-hover:text-site-primary sm:text-3xl"
        }
      >
        studio@shamrockartstudio.com
      </span>
      <span
        className={light ? "text-sm text-stone-600" : "text-sm text-site-secondary"}
      >
        For artwork inquiries, print questions, and order support.
      </span>
    </a>
  );
}
