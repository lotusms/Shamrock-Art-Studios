/** Shared inner page shell — matches site typography & slate surface */
export default function PageLayout({ title, eyebrow, children }) {
  return (
    <main className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-28 pt-[calc(4.25rem+3rem)] sm:px-10 lg:px-12">
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.32em] text-slate-400">{eyebrow}</p>
      ) : null}
      <h1 className="font-serif mt-3 text-4xl font-medium tracking-[-0.03em] text-stone-100 sm:text-5xl">
        {title}
      </h1>
      <div className="mt-8 space-y-5 text-base leading-8 text-stone-200/90">
        {children}
      </div>
    </main>
  );
}
