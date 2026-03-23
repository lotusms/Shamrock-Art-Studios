import InnerPageBackdrop from "@/components/InnerPageBackdrop";

export default function PageLayout({
  eyebrow,
  title,
  subtitle,
  children,
  width: _width = "default",
}) {
  const layoutWidth = "max-w-7xl";

  return (
    <main className="relative z-10 w-full min-w-0">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-2 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <InnerPageBackdrop />
      <div
        className={`relative z-10 mx-auto w-full px-6 pb-28 pt-29 sm:px-10 lg:px-12 ${layoutWidth}`}
      >
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-serif mt-3 text-4xl font-medium tracking-[-0.03em] text-stone-100 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-full text-lg leading-relaxed text-stone-300/95 sm:text-xl lg:max-w-[75%]">
            {subtitle}
          </p>
        ) : null}
        <div className="mt-10 space-y-6 text-base leading-8 text-stone-200/90 sm:space-y-8 sm:text-[1.05rem] sm:leading-9">
          {children}
        </div>
      </div>
    </main>
  );
}
