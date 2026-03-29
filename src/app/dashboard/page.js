"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardActivityChart from "@/components/dashboard/DashboardActivityChart";
import {
  computeOrderStats,
  monthlySeriesLast12Months,
} from "@/lib/dashboard-stats";
import { fetchOrdersForCurrentUser } from "@/lib/orders-queries";
import { formatUsd } from "@/lib/money";

function Card({ title, a, b, aLabel, bLabel, sub }) {
  return (
    <div className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 shadow-lg shadow-slate-950/30 backdrop-blur">
      <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">
        {title}
      </h2>
      <div className="mt-4 flex gap-8">
        <div>
          <p className="text-3xl font-semibold text-amber-200/95 tabular-nums">
            {a}
          </p>
          <p className="text-xs text-slate-500">{aLabel}</p>
        </div>
        <div>
          <p className="text-3xl font-semibold text-sky-200/90 tabular-nums">
            {b}
          </p>
          <p className="text-xs text-slate-500">{bLabel}</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

export default function DashboardHomePage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [catalog, setCatalog] = useState({
    live: null,
    variants: null,
    loading: true,
  });

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    (async () => {
      setOrdersLoading(true);
      setOrdersError("");
      try {
        const list = await fetchOrdersForCurrentUser();
        if (!cancelled) setOrders(list);
      } catch (e) {
        if (!cancelled) {
          setOrdersError(
            e instanceof Error ? e.message : "Could not load orders.",
          );
          setOrders([]);
        }
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/catalog/products", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data?.ok && Array.isArray(data.products)) {
          const products = data.products;
          const variants = products.reduce(
            (sum, p) =>
              sum + (Array.isArray(p.variants) ? p.variants.length : 0),
            0,
          );
          setCatalog({ live: products.length, variants, loading: false });
        } else {
          setCatalog({ live: null, variants: null, loading: false });
        }
      } catch {
        if (!cancelled) {
          setCatalog({ live: null, variants: null, loading: false });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => computeOrderStats(orders), [orders]);
  const chartData = useMemo(() => monthlySeriesLast12Months(orders), [orders]);

  const loading = authLoading || ordersLoading;

  const cards = [
    {
      title: "Orders",
      a: loading ? "…" : String(stats.ordersThisMonth),
      b: loading ? "…" : String(stats.ordersAll),
      aLabel: "This month",
      bLabel: "All time",
      sub: "Orders in Firestore tied to your account email.",
    },
    {
      title: "Revenue",
      a: loading ? "…" : formatUsd(stats.revenueThisMonth),
      b: loading ? "…" : formatUsd(stats.revenueAll),
      aLabel: "This month",
      bLabel: "All time",
      sub: "Sum of order totals (USD) from your orders.",
    },
    {
      title: "Recipients",
      a: loading ? "…" : String(stats.uniqueShipToThisMonth),
      b: loading ? "…" : String(stats.uniqueShipToAll),
      aLabel: "This month",
      bLabel: "All time",
      sub: "Unique ship-to addresses (name + postal code).",
    },
    // {
    //   title: "Catalog",
    //   a: catalog.loading ? "…" : catalog.live != null ? String(catalog.live) : "—",
    //   b: catalog.loading ? "…" : catalog.variants != null ? String(catalog.variants) : "—",
    //   aLabel: "Products",
    //   bLabel: "Variants",
    //   sub: "Live Printful sync from /api/catalog/products.",
    // },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] text-stone-100 sm:text-5xl">
          Dashboard
        </h1>
        <p className="mt-2 text-lg leading-relaxed text-stone-300/95 sm:text-xl">
          Overview of your orders and storefront catalog — updated from Firestore
          and the live catalog API.
        </p>
      </div>

      {ordersError ? (
        <p className="mb-6 text-sm text-red-400/90" role="alert">
          {ordersError}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Card
            key={c.title}
            title={c.title}
            a={c.a}
            b={c.b}
            aLabel={c.aLabel}
            bLabel={c.bLabel}
            sub={c.sub}
          />
        ))}
      </div>

      <div className="mt-10 rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 shadow-lg shadow-slate-950/30 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">
              Activity
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Last 12 months — revenue (bars) and order count (line).
            </p>
          </div>
        </div>
        <div className="mt-4 min-h-[280px] rounded-2xl border border-slate-700/35 bg-slate-950/50 p-2 sm:p-4">
          {loading ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
              Loading chart…
            </div>
          ) : (
            <DashboardActivityChart data={chartData} />
          )}
        </div>
      </div>
    </div>
  );
}
