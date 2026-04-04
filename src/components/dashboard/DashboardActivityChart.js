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
 * @param {{ light?: boolean }} props
 */
export default function DashboardActivityChart({ data, light = false }) {
  const gridStroke = light ? "rgba(120, 113, 108, 0.25)" : "rgba(148, 163, 184, 0.2)";
  const tickFill = light ? "#57534e" : "#94a3b8";
  const axisLine = light ? "rgba(120, 113, 108, 0.4)" : "rgba(148, 163, 184, 0.35)";
  const tooltipBg = light ? "rgb(255 255 255 / 0.98)" : "rgb(15 23 42 / 0.96)";
  const tooltipBorder = light ? "rgb(214 211 209)" : "rgb(51 65 85)";
  const labelColor = light ? "#1c1917" : "#e7e5e4";
  const barFill = light ? "rgba(217, 119, 6, 0.55)" : "rgba(251, 191, 36, 0.5)";
  const lineStroke = light ? "#0369a1" : "#7dd3fc";
  const legendColor = light ? "#44403c" : "#a8a29e";

  return (
    <div className="h-[280px] w-full min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridStroke}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: tickFill, fontSize: 11 }}
            axisLine={{ stroke: axisLine }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: tickFill, fontSize: 11 }}
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
            tick={{ fill: tickFill, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: "10px",
              color: legendColor,
            }}
            labelStyle={{ color: labelColor, fontWeight: 600 }}
            formatter={(value, name) => {
              const n = String(name);
              if (n === "revenue" || n === "Revenue") {
                return [formatUsd(Number(value)), "Revenue"];
              }
              return [value, "Orders"];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12, color: legendColor }}
          />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            name="Revenue"
            fill={barFill}
            radius={[4, 4, 0, 0]}
            maxBarSize={44}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke={lineStroke}
            strokeWidth={2}
            dot={{ r: 3, fill: lineStroke }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
