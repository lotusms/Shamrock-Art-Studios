import Link from "next/link";

const baseClasses =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98]";

const variantClasses = {
  primary:
    "bg-linear-to-br from-amber-100 via-stone-100 to-slate-300 text-slate-900 shadow-lg shadow-slate-900/35 ring-2 ring-white/30 hover:scale-[1.04] hover:shadow-xl hover:shadow-amber-400/25 hover:brightness-105",
  secondary:
    "border-2 border-slate-500/50 bg-slate-900/55 text-stone-100 shadow-inner shadow-slate-950/40 ring-1 ring-inset ring-slate-600/30 backdrop-blur-md hover:border-amber-400/45 hover:bg-slate-800/65 hover:shadow-lg hover:shadow-slate-950/40",
};

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
}) {
  const classes = `${baseClasses} ${variantClasses[variant] ?? variantClasses.primary} ${className}`.trim();

  if (href) {
    const internal = href.startsWith("/") && !href.startsWith("//");
    if (internal) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return <button className={classes}>{children}</button>;
}
