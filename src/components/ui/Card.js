"use client";

import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import { cardTitleClassForVariant } from "@/lib/cardTitle";
import { isLightThemeId } from "@/theme";

const BASE_CARD_CLASSES = "rounded-4xl border-2 p-8 text-site-fg";

const VARIANT_CLASSES_DARK = {
  default:
    "border-slate-700/40 bg-slate-900/45 shadow-lg shadow-slate-950/30 backdrop-blur",
  emerald: "border-emerald-500/25 bg-slate-900/50 shadow-lg shadow-slate-950/30",
  amber:
    "border-amber-400/25 bg-slate-900/45 shadow-lg shadow-slate-950/30 backdrop-blur",
  gradient:
    "border-slate-600/35 bg-linear-to-br from-slate-800/35 to-slate-950/50 ring-2 ring-slate-500/15 backdrop-blur-md",
  inset:
    "border-slate-700/40 bg-slate-900/50 shadow-inner shadow-slate-950/40 backdrop-blur-sm",
};

/** Light site themes — paper / glass surfaces that match the page. */
const VARIANT_CLASSES_LIGHT = {
  default:
    "border-stone-300/50 bg-white/88 shadow-lg shadow-stone-400/15 backdrop-blur-md",
  emerald:
    "border-emerald-300/45 bg-emerald-50/90 shadow-lg shadow-emerald-900/10 backdrop-blur-sm",
  amber:
    "border-amber-300/45 bg-amber-50/88 shadow-lg shadow-amber-900/10 backdrop-blur-sm",
  gradient:
    "border-stone-300/45 bg-linear-to-br from-white/95 to-stone-100/95 ring-2 ring-stone-200/45 backdrop-blur-md",
  inset:
    "border-stone-300/50 bg-stone-100/92 shadow-inner shadow-stone-400/25 backdrop-blur-sm",
};

export default function Card({
  variant = "default",
  className = "",
  title,
  titleClassName = "",
  titleTag = "p",
  children,
  ...rest
}) {
  const themeId = useDocumentThemeId();
  const lightSurface = isLightThemeId(themeId);
  const surfaceMap = lightSurface ? VARIANT_CLASSES_LIGHT : VARIANT_CLASSES_DARK;
  const TitleTag = titleTag;
  const cardClasses = `${BASE_CARD_CLASSES} ${
    surfaceMap[variant] ?? surfaceMap.default
  } ${className}`.trim();
  const headingClasses = `${cardTitleClassForVariant(variant, themeId)} ${titleClassName}`.trim();

  return (
    <div
      className={cardClasses}
      data-card-surface={lightSurface ? "light" : "dark"}
      {...rest}
    >
      {title ? <TitleTag className={headingClasses}>{title}</TitleTag> : null}
      {children}
    </div>
  );
}
