"use client";

import Card from "@/components/ui/Card";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import { isLightThemeId } from "@/theme";

/**
 * @param {{ lines: string[] }} props
 */
export default function ContactHelpfulDetailsCard({ lines }) {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
  const body = light ? "text-stone-800/95" : "text-site-fg/90";
  const footer = light ? "text-stone-600" : "text-site-secondary";
  const footerBorder = light ? "border-stone-300/50" : "border-site-fg/10";

  return (
    <Card
      variant="inset"
      title="Helpful Details to Include"
      titleTag="h4"
      className="min-w-0 flex-9"
    >
      <p className={`mt-8 text-sm leading-7 ${body}`}>
        To help us respond more clearly, please include:
      </p>
      <ul className={`mt-5 space-y-4 text-sm leading-4 ${body}`}>
        {lines.map((line) => (
          <li key={line} className="flex gap-3">
            <span
              className={
                light
                  ? "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 shadow-[0_0_8px] shadow-amber-500/35"
                  : "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/80 shadow-[0_0_10px] shadow-amber-400/40"
              }
              aria-hidden
            />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <p
        className={`mt-8 border-t px-12 pt-6 text-center text-xs uppercase tracking-[0.22em] ${footerBorder} ${footer}`}
      >
        Special inquiries are reviewed based on artist&apos;s schedule.
      </p>
    </Card>
  );
}
