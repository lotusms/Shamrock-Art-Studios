"use client";

import Card from "@/components/ui/Card";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import { isLightThemeId } from "@/theme";

/**
 * @param {{ orgName: string; principles: { title: string; body: string }[] }} props
 */
export default function AboutStudioCards({ orgName, principles }) {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
  const body = light ? "text-stone-800/95" : "text-site-fg/90";
  const quote = light ? "text-stone-900" : "text-site-fg";
  const muted = light ? "text-stone-600" : "text-site-secondary";
  const sectionLabel = light ? "text-stone-600" : "text-slate-400";

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <Card variant="inset" title="Online Art Studio">
          <p className={`mt-5 leading-7 ${body}`}>
            {orgName} operates as an online-first gallery, offering original artwork,
            canvas prints, and special requests without the need for a physical storefront.
            This allows collectors to browse and buy art online while receiving work
            shipped directly to their home.
          </p>
        </Card>

        <Card
          variant="inset"
          className="flex flex-col justify-between"
          title="In one line"
        >
          <div>
            <p
              className={`mt-4 font-serif text-xl font-medium italic leading-relaxed sm:text-2xl ${quote}`}
            >
              “Original art, prints, and creative growth shared through a modern online
              gallery.”
            </p>
          </div>
          <p
            className={`flex justify-end text-xs uppercase tracking-[0.28em] ${muted}`}
          >
            — Jas Perez, Artist
          </p>
        </Card>
      </div>

      <div>
        <p className={`text-xs uppercase tracking-[0.32em] ${sectionLabel}`}>
          Principles
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {principles.map((item) => (
            <Card variant="amber" title={item.title} key={item.title}>
              <p className={`mt-3 text-sm leading-7 ${body}`}>{item.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
