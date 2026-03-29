"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatUsd } from "@/lib/money";

/**
 * @param {{ label: string; orders: number; revenue: number }[]} data
 */
export default function DashboardActivityChart({ data }) {
  return (
    <div className="h-[280px] w-full min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(148, 163, 184, 0.2)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "rgba(148, 163, 184, 0.35)" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
            }
            width={48}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(15 23 42 / 0.96)",
              border: "1px solid rgb(51 65 85)",
              borderRadius: "10px",
            }}
            labelStyle={{ color: "#e7e5e4", fontWeight: 600 }}
            formatter={(value, name) => {
              const n = String(name);
              if (n === "revenue" || n === "Revenue") {
                return [formatUsd(Number(value)), "Revenue"];
              }
              return [value, "Orders"];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            name="Revenue"
            fill="rgba(251, 191, 36, 0.5)"
            radius={[4, 4, 0, 0]}
            maxBarSize={44}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke="#7dd3fc"
            strokeWidth={2}
            dot={{ r: 3, fill: "#7dd3fc" }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
