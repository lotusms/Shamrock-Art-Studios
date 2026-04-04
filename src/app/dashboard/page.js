"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardActivityChart from "@/components/dashboard/DashboardActivityChart";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import * as dash from "@/lib/dashboardChrome";
import {
  computeOrderStats,
  monthlySeriesLast12Months,
} from "@/lib/dashboard-stats";
import { fetchOrdersForCurrentUser } from "@/lib/orders-queries";
import { formatUsd } from "@/lib/money";
import * as overlayChrome from "@/lib/overlayChrome";
import { isLightThemeId } from "@/theme";

function StatCard({ title, a, b, aLabel, bLabel, sub, light }) {
  return (
    <div className={dash.dashboardStatCard(light)}>
      <h2 className={dash.dashboardStatHeading(light)}>{title}</h2>
      <div className="mt-4 flex gap-8">
        <div>
          <p className={dash.dashboardStatNumberAmber(light)}>{a}</p>
          <p className={dash.dashboardStatCaption(light)}>{aLabel}</p>
        </div>
        <div>
          <p className={dash.dashboardStatNumberSky(light)}>{b}</p>
          <p className={dash.dashboardStatCaption(light)}>{bLabel}</p>
        </div>
      </div>
      <p className={dash.dashboardStatSub(light)}>{sub}</p>
    </div>
  );
}

export default function DashboardHomePage() {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
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
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10">
        <h1 className={dash.dashboardPageTitle(light)}>Dashboard</h1>
        <p className={dash.dashboardPageSubtitle(light)}>
          Overview of your orders and storefront catalog — updated from Firestore
          and the live catalog API.
        </p>
      </div>

      {ordersError ? (
        <p
          className={`mb-6 text-sm ${light ? "text-rose-700" : "text-red-400/90"}`}
          role="alert"
        >
          {ordersError}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <StatCard
            key={c.title}
            title={c.title}
            a={c.a}
            b={c.b}
            aLabel={c.aLabel}
            bLabel={c.bLabel}
            sub={c.sub}
            light={light}
          />
        ))}
      </div>

      <div className={dash.dashboardChartOuter(light)}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className={dash.dashboardActivityTitle(light)}>Activity</h2>
            <p className={dash.dashboardActivityCaption(light)}>
              Last 12 months — revenue (bars) and order count (line).
            </p>
          </div>
        </div>
        <div className={dash.dashboardChartInner(light)}>
          {loading ? (
            <div
              className={`flex h-[280px] items-center justify-center text-sm ${overlayChrome.pageMutedText(light)}`}
            >
              Loading chart…
            </div>
          ) : (
            <DashboardActivityChart data={chartData} light={light} />
          )}
        </div>
      </div>
    </div>
  );
}
