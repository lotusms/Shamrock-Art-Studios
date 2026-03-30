export default function HomeStudioAbout({ notes }) {
  return (
    <section
      id="about"
      className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-14 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-20"
    >
      <div className="rounded-4xl border-2 border-slate-600/35 bg-linear-to-br from-slate-800/40 via-slate-900/35 to-slate-950/50 p-8 shadow-xl shadow-slate-950/35 ring-2 ring-slate-500/20 backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.32em] text-amber-300">
          Studio direction
        </p>
        <h2 className="font-serif mt-4 text-3xl font-medium tracking-[-0.02em] text-stone-100 sm:text-4xl">
          <span className="text-gradient-hero-subtle not-italic">
            Modern, immersive,
          </span>{" "}
          and intentionally unbound from a physical address.
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-8 text-stone-200/90">
          The strongest direction for this brand is a digital gallery that feels
          exclusive but frictionless: sharp typography, restrained copy,
          immersive artwork, and clear paths for inquiry, acquisition, and
          commissions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {notes.map((note) => (
          <article
            key={note}
            className="rounded-4xl border-2 border-slate-700/30 bg-slate-900/50 p-6 transition duration-300 hover:border-amber-400/35 hover:bg-slate-800/55 hover:shadow-lg hover:shadow-slate-950/30"
          >
            <p className="text-sm leading-7 text-stone-200/90">{note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
