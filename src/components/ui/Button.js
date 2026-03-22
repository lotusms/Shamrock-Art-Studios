const baseClasses =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1810] active:scale-[0.98]";

const variantClasses = {
  primary:
    "bg-linear-to-br from-lime-300 via-fuchsia-200 to-emerald-300 text-emerald-900 shadow-lg shadow-lime-400/30 ring-2 ring-white/40 hover:scale-[1.04] hover:shadow-xl hover:shadow-fuchsia-400/35 hover:brightness-105",
  secondary:
    "border-2 border-fuchsia-400/45 bg-lime-950/35 text-pink-50 shadow-inner shadow-emerald-900/20 ring-1 ring-inset ring-lime-400/20 backdrop-blur-md hover:border-lime-300/60 hover:bg-fuchsia-950/25 hover:shadow-lg hover:shadow-lime-400/20",
};

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
}) {
  const classes = `${baseClasses} ${variantClasses[variant] ?? variantClasses.primary} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return <button className={classes}>{children}</button>;
}
