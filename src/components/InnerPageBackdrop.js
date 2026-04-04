/** Soft ambient layers — matches homepage atmosphere without competing with content */
export default function InnerPageBackdrop({ light = false }) {
  if (light) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-85"
      >
        <div className="animate-aura-1 absolute -left-20 top-0 h-80 w-80 rounded-full bg-violet-300/25 blur-3xl" />
        <div className="animate-aura-2 absolute right-0 top-32 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="animate-aura-3 absolute bottom-20 left-1/3 h-72 w-72 rounded-full bg-fuchsia-200/20 blur-3xl" />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 opacity-90"
    >
      <div className="animate-aura-1 absolute -left-20 top-0 h-80 w-80 rounded-full bg-slate-600/18 blur-3xl" />
      <div className="animate-aura-2 absolute right-0 top-32 h-96 w-96 rounded-full bg-amber-400/12 blur-3xl" />
      <div className="animate-aura-3 absolute bottom-20 left-1/3 h-72 w-72 rounded-full bg-slate-500/14 blur-3xl" />
    </div>
  );
}
