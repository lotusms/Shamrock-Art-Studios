"use client";

import Link from "next/link";

const BASE_CLASSES =
  "inline-flex min-w-fit items-center justify-center gap-2 rounded-full border-2 border-slate-600/60 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-stone-200 shadow-md shadow-slate-950/45 ring-1 ring-white/5 backdrop-blur-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:border-amber-400/40 hover:bg-slate-800/80 hover:text-stone-100 hover:shadow-xl hover:shadow-slate-950/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60";

export default function SecondaryButton({
  href,
  type = "button",
  icon = null,
  iconPosition = "left",
  className = "",
  children,
  ...props
}) {
  const hasIcon = Boolean(icon);
  const classes = `${BASE_CLASSES} ${className}`.trim();
  const content = (
    <>
      {icon && iconPosition === "left" ? icon : null}
      <span className={hasIcon ? "" : "text-center"}>{children}</span>
      {icon && iconPosition === "right" ? icon : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {content}
    </button>
  );
}
