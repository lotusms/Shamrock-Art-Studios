export default function HomePageDecor() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-2 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-90">
        <div className="animate-aura-1 absolute left-0 top-0 h-96 w-96 rounded-full bg-slate-600/22 blur-3xl" />
        <div className="animate-aura-2 absolute right-0 top-24 h-112 w-md rounded-full bg-amber-400/18 blur-3xl" />
        <div className="animate-aura-3 absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-slate-500/18 blur-3xl" />
        <div className="animate-aura-2 absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
      </div>
    </>
  );
}
