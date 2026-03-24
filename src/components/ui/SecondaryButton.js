"use client";

import Link from "next/link";

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 text-sm text-slate-500 underline decoration-slate-600 underline-offset-4 transition hover:text-stone-300 disabled:cursor-not-allowed disabled:opacity-60 min-w-fit";

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
