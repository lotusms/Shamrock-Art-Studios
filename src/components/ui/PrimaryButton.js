"use client";

import Link from "next/link";

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/35 ring-2 ring-white/30 transition hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 min-w-fit";

const VARIANT_CLASSES =
  "bg-linear-to-br from-amber-100 via-stone-100 to-slate-300 min-w-fit";

export default function PrimaryButton({
  href,
  type = "button",
  icon = null,
  iconPosition = "left",
  className = "",
  children,
  ...props
}) {
  const classes = `${BASE_CLASSES} ${VARIANT_CLASSES} ${className}`.trim();
  const content = (
    <>
      {icon && iconPosition === "left" ? icon : null}
      <span>{children}</span>
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
