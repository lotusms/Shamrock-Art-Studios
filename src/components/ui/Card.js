const BASE_CARD_CLASSES = "rounded-4xl border-2 p-8";

const VARIANT_CLASSES = {
  default:
    "border-slate-700/40 bg-slate-900/45 shadow-lg shadow-slate-950/30 backdrop-blur",
  emerald: "border-emerald-500/25 bg-slate-900/50 shadow-lg shadow-slate-950/30",
  gradient:
    "border-slate-600/35 bg-linear-to-br from-slate-800/35 to-slate-950/50 ring-2 ring-slate-500/15 backdrop-blur-md",
  inset:
    "border-slate-700/40 bg-slate-900/50 shadow-inner shadow-slate-950/40 backdrop-blur-sm",
};

const TITLE_VARIANT_CLASSES = {
  default: "text-xs uppercase tracking-[0.32em] text-slate-400",
  emerald: "text-xs uppercase tracking-[0.32em] text-emerald-400/90",
  amber: "text-xs uppercase tracking-[0.32em] text-amber-300",
  gradient: "text-xs uppercase tracking-[0.32em] text-slate-400",
  inset: "text-xs uppercase tracking-[0.32em] text-amber-300/90",
};

export default function Card({
  variant = "default",
  className = "",
  title,
  titleClassName = "",
  titleTag = "p",
  children,
}) {
  const TitleTag = titleTag;
  const cardClasses = `${BASE_CARD_CLASSES} ${
    VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default
  } ${className}`.trim();
  const headingClasses = `${TITLE_VARIANT_CLASSES[variant] ?? TITLE_VARIANT_CLASSES.default} ${titleClassName}`.trim();

  return (
    <div className={cardClasses}>
      {title ? <TitleTag className={headingClasses}>{title}</TitleTag> : null}
      {children}
    </div>
  );
}
