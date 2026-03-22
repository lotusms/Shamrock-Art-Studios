const baseClasses =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#140916] active:scale-[0.98]";

const variantClasses = {
  primary:
    "bg-linear-to-br from-rose-200 via-pink-200 to-rose-100 text-rose-950 shadow-lg shadow-fuchsia-950/30 ring-1 ring-white/25 hover:scale-[1.03] hover:shadow-xl hover:shadow-fuchsia-500/25 hover:brightness-105",
  secondary:
    "border border-rose-200/25 bg-rose-100/8 text-rose-50 shadow-inner shadow-black/20 ring-1 ring-inset ring-white/5 backdrop-blur hover:border-fuchsia-300/40 hover:bg-rose-100/12 hover:shadow-lg hover:shadow-fuchsia-500/15 hover:ring-rose-200/30",
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
