"use client";

import Link from "next/link";

/** Shared styles for uppercase amber “View” / text links (shop, hero). */
export const linkButtonClasses =
  "hidden shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/90 underline decoration-amber-400/50 underline-offset-4 transition hover:text-amber-200 hover:decoration-amber-300/70 sm:inline";

/** Light site themes — readable on pale scrims / cards. */
export const linkButtonClassesLight =
  "hidden shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900/95 underline decoration-amber-700/55 underline-offset-4 transition hover:text-amber-950 hover:decoration-amber-800/70 sm:inline";

export default function LinkButton({ href, children, className = "", ...props }) {
  return (
    <Link
      href={href}
      className={`${linkButtonClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </Link>
  );
}
