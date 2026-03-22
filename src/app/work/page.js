import Link from "next/link";
import PageLayout from "@/components/PageLayout";

export const metadata = {
  title: "Work | Shamrock Art Studio",
  description:
    "How Shamrock Art Studio presents work online: series, drops, and a living catalog built for collectors.",
};

const pillars = [
  {
    title: "Editorial pacing",
    body:
      "Works are sequenced like a publication—rhythm, contrast, and negative space so each piece gets its moment.",
  },
  {
    title: "Cinematic crops",
    body:
      "Aspect ratios stay intentional. The grid is asymmetric on purpose so the collection feels curated, not templated.",
  },
  {
    title: "Always-on viewing",
    body:
      "No opening hours. Collectors, curators, and interiors teams can return to the same URL as the catalog evolves.",
  },
];

const stats = [
  { value: "24/7", label: "global access" },
  { value: "Series", label: "drop-friendly structure" },
  { value: "01", label: "site as primary exhibition" },
];

export default function WorkPage() {
  return (
    <PageLayout
      eyebrow="Collection"
      title="Work"
      subtitle="A living catalog on the web—where the studio is the room, and the room never closes."
      width="wide"
    >
      <p className="max-w-3xl text-lg leading-relaxed text-stone-200/95 sm:text-xl sm:leading-8">
        Shamrock isn&apos;t a PDF on a shelf. It&apos;s a{" "}
        <span className="text-gradient-hero">future-facing</span> presentation
        layer: every surface is tuned so artwork reads first, interface second.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-5 shadow-lg shadow-slate-950/30 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-amber-400/30 hover:shadow-slate-900/40"
          >
            <p className="bg-linear-to-br from-white via-stone-100 to-amber-200 bg-clip-text text-2xl font-semibold tracking-[-0.04em] text-transparent sm:text-3xl">
              {item.value}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {pillars.map((item) => (
          <article
            key={item.title}
            className="rounded-3xl border-2 border-slate-700/35 bg-slate-900/50 p-6 backdrop-blur-sm transition duration-300 hover:border-amber-400/25 hover:bg-slate-800/40"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-amber-300/90">
              {item.title}
            </p>
            <p className="mt-2 text-sm leading-7 text-stone-200/90">{item.body}</p>
          </article>
        ))}
      </div>

      <div className="rounded-4xl border-2 border-slate-600/35 bg-linear-to-br from-slate-800/40 via-slate-900/35 to-slate-950/50 p-8 shadow-xl shadow-slate-950/35 ring-2 ring-slate-500/20 backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.32em] text-amber-300">
          Preview on the homepage
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-200/90">
          The main landing page carries a modular gallery grid with the same
          editorial spacing philosophy—use it as a development stand-in, then
          replace imagery with your own series when you&apos;re ready to ship.
        </p>
        <Link
          href="/#collection"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-200/90 transition hover:text-amber-100"
        >
          <span className="border-b border-amber-400/40 pb-0.5">
            Jump to collection preview
          </span>
          <span aria-hidden className="text-lg leading-none">
            →
          </span>
        </Link>
      </div>
    </PageLayout>
  );
}
