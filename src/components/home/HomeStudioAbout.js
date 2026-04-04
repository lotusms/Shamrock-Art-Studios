"use client";

import { orgName } from "@/config";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import { isLightThemeId } from "@/theme";

export default function HomeStudioAbout({ notes }) {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);

  const heroPanel = light
    ? "rounded-4xl border-2 border-stone-300/50 bg-linear-to-br from-white/95 via-stone-50/95 to-stone-100/90 p-8 shadow-xl shadow-stone-400/20 ring-2 ring-stone-200/40 backdrop-blur-md"
    : "rounded-4xl border-2 border-slate-600/35 bg-linear-to-br from-slate-800/40 via-slate-900/35 to-slate-950/50 p-8 shadow-xl shadow-slate-950/35 ring-2 ring-slate-500/20 backdrop-blur-md";

  const eyebrow = light
    ? "text-xs uppercase tracking-[0.32em] text-amber-800"
    : "text-xs uppercase tracking-[0.32em] text-amber-300";

  const heading = light
    ? "font-serif mt-4 text-3xl font-medium tracking-[-0.02em] text-stone-900 sm:text-4xl"
    : "font-serif mt-4 text-3xl font-medium tracking-[-0.02em] text-stone-100 sm:text-4xl";

  const lead = light
    ? "mt-5 max-w-xl text-sm leading-8 text-stone-800/95"
    : "mt-5 max-w-xl text-sm leading-8 text-stone-200/90";

  const article = light
    ? "rounded-4xl border-2 border-stone-300/45 bg-white/88 p-6 shadow-sm shadow-stone-400/10 transition duration-300 hover:border-amber-400/45 hover:bg-amber-50/50 hover:shadow-lg hover:shadow-stone-400/20"
    : "rounded-4xl border-2 border-slate-700/30 bg-slate-900/50 p-6 transition duration-300 hover:border-amber-400/35 hover:bg-slate-800/55 hover:shadow-lg hover:shadow-slate-950/30";

  const cardTitle = light
    ? "font-serif text-2xl font-semibold tracking-[-0.02em] text-stone-900"
    : "font-serif text-2xl font-semibold tracking-[-0.02em] text-white";

  const cardBody = light
    ? "mt-4 text-sm leading-7 text-stone-700"
    : "mt-4 text-sm leading-7 text-stone-300";

  return (
    <section
      id="about"
      className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-14 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-20"
    >
      <div className={heroPanel}>
        <p className={eyebrow}>Studio direction</p>
        <h2 className={heading}>
          An Online Art Studio for Collectors, Gift Buyers, and Art Lovers Worldwide
        </h2>
        <p className={lead}>
          {orgName} is an independent online art studio created to share and sell original work
          directly from the artist. From expressive abstract pieces to realistic paintings and
          detailed pencil work, the studio offers a growing portfolio for collectors, home
          decorators, and anyone looking to buy unique art online.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {notes.map((note, idx) => (
          <article key={idx} className={article}>
            <h3 className={cardTitle}>
              <span className="block leading-[1.15]">{note.title[0]}</span>
              <span className="block leading-[1.15]">{note.title[1]}</span>
            </h3>
            <p className={cardBody}>{note.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
