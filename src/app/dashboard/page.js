"use client";

export default function DashboardHomePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10">
        <h1 className="font-serif text-3xl font-semibold text-stone-100">
          Dashboard
        </h1>
        <p className="mt-2 text-slate-500">
          Overview of your studio — orders and activity will appear here as you
          connect data.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Orders",
            a: "—",
            b: "—",
            sub: "Total orders in Firestore",
            aLabel: "This month",
            bLabel: "All time",
          },
          {
            title: "Revenue",
            a: "—",
            b: "—",
            sub: "Connect reporting to populate",
            aLabel: "Estimated",
            bLabel: "Confirmed",
          },
          {
            title: "Customers",
            a: "—",
            b: "—",
            sub: "Unique buyer emails",
            aLabel: "New",
            bLabel: "Returning",
          },
          {
            title: "Products",
            a: "—",
            b: "—",
            sub: "Catalog sync status",
            aLabel: "Live",
            bLabel: "Draft",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-white/[0.06] bg-[#0b0f1a] p-6"
          >
            <h2 className="text-sm font-medium text-slate-400">{card.title}</h2>
            <div className="mt-4 flex gap-8">
              <div>
                <p className="text-3xl font-semibold text-lime-400">{card.a}</p>
                <p className="text-xs text-slate-600">{card.aLabel}</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-sky-400/90">{card.b}</p>
                <p className="text-xs text-slate-600">{card.bLabel}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-600">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-white/[0.06] bg-[#0b0f1a] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-slate-400">Activity</h2>
          <p className="text-xs text-slate-600">
            Chart placeholder — wire to your analytics when ready.
          </p>
        </div>
        <div className="mt-8 flex h-48 items-end justify-center gap-2 rounded-lg border border-dashed border-white/[0.08] bg-[#070b14] px-4 pb-4">
          {[
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ].map((m, i) => (
            <div key={m} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full max-w-[2rem] rounded-t bg-lime-400/30"
                style={{ height: i === 2 ? "40%" : "8%" }}
              />
              <span className="text-[0.65rem] text-slate-600">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
