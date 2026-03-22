import PageLayout from "@/components/PageLayout";

export const metadata = {
  title: "Contact | Shamrock Art Studio",
  description:
    "Inquire about acquisitions, commissions, and private previews at Shamrock Art Studio.",
};

const checklist = [
  "The piece or series you’re drawn to (title, scale, or screenshot)",
  "Timeline—collecting now, sourcing for a project, or exploring",
  "Location & shipping context (helps us respond with clarity)",
];

export default function ContactPage() {
  return (
    <PageLayout
      eyebrow="Inquiries"
      title="Contact"
      subtitle="Tell us what you’re looking for. We read every message and reply with care—not automation."
      width="wide"
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div className="space-y-6">
          <p className="text-lg leading-relaxed text-stone-200/95 sm:text-xl sm:leading-8">
            Use email for first contact. It keeps attachments, links, and
            references in one thread—{" "}
            <span className="text-gradient-hero">the way collectors already work.</span>
          </p>
          <a
            href="mailto:studio@shamrockart.example"
            className="group inline-flex w-fit flex-col gap-1 rounded-2xl border-2 border-slate-600/45 bg-slate-900/50 px-6 py-5 shadow-lg shadow-slate-950/35 transition hover:border-amber-400/35 hover:bg-slate-800/50"
          >
            <span className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Write
            </span>
            <span className="font-serif text-2xl font-medium tracking-[-0.02em] text-stone-100 transition group-hover:text-amber-100 sm:text-3xl">
              studio@shamrockart.example
            </span>
            <span className="text-sm text-stone-400">
              Replace with your real address before launch.
            </span>
          </a>
          <p className="text-sm leading-7 text-stone-400">
            Typical response: <span className="text-stone-300">2–4 business days</span>
            . For time-sensitive commissions, say so in the subject line.
          </p>
        </div>

        <aside className="rounded-4xl border-2 border-slate-700/40 bg-slate-900/50 p-8 shadow-inner shadow-slate-950/40 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.32em] text-amber-300/90">
            Include
          </p>
          <ul className="mt-5 space-y-4 text-sm leading-7 text-stone-200/90">
            {checklist.map((line) => (
              <li key={line} className="flex gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/80 shadow-[0_0_10px] shadow-amber-400/40"
                  aria-hidden
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 border-t border-white/5 pt-6 text-xs uppercase tracking-[0.22em] text-slate-500">
            Calendar / video calls by request after first reply.
          </p>
        </aside>
      </div>

      <div className="rounded-3xl border border-dashed border-slate-600/50 bg-slate-900/30 px-6 py-8 text-center sm:px-10">
        <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
          Next step
        </p>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-stone-400">
          Drop in a form builder (Tally, Basin, or your own API route) when
          you&apos;re ready—this layout reserves the rhythm so the UI still feels
          gallery-quiet.
        </p>
      </div>
    </PageLayout>
  );
}
