import PageLayout from "@/components/PageLayout";

function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-800/70 ${className}`.trim()}
      aria-hidden
    />
  );
}

export default function Loading() {
  return (
    <PageLayout eyebrow="Artwork" title="Loading piece…" width="full">
      <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="overflow-hidden border-2 border-slate-600/40 bg-slate-900/50 shadow-2xl shadow-slate-950/40">
          <div className="aspect-square w-full animate-pulse bg-slate-800/70" />
        </div>

        <div className="flex flex-col">
          <div className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/50 p-8 shadow-inner shadow-slate-950/40 backdrop-blur-sm">
            <SkeletonBlock className="h-3 w-16 rounded-full" />
            <SkeletonBlock className="mt-4 h-12 w-44" />

            <div className="mt-8 space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center justify-between gap-4">
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-4 w-28" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-24" />
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <SkeletonBlock className="h-12 w-full sm:min-w-[200px]" />
              <SkeletonBlock className="h-6 w-32" />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <SkeletonBlock className="h-5 w-full" />
            <SkeletonBlock className="h-5 w-[92%]" />
            <SkeletonBlock className="h-5 w-[86%]" />
            <SkeletonBlock className="h-5 w-[78%]" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
