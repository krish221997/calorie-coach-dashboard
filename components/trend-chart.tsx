"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DayTotals } from "@/lib/meals";

interface ChartPoint {
  date: string;
  short: string;
  kcal: number;
  proteinG: number;
}

function toChartPoints(days: DayTotals[]): ChartPoint[] {
  // days comes sorted newest-first; reverse for time axis
  return days
    .slice()
    .reverse()
    .map((d) => {
      const short = d.date.slice(5); // MM-DD
      return {
        date: d.date,
        short,
        kcal: Math.round(d.kcal),
        proteinG: Math.round(d.proteinG),
      };
    });
}

type TooltipValue = number | string | readonly (number | string)[] | undefined;

function tooltipFormatter(value: TooltipValue, key: unknown): [string, string] {
  const v = Array.isArray(value)
    ? (value as readonly (number | string)[]).join(", ")
    : String(value ?? "");
  const k = String(key);
  if (k === "kcal") return [`${v} kcal`, "Calories"];
  if (k === "proteinG") return [`${v} g`, "Protein"];
  return [v, k];
}

export function TrendChart({ days }: { days: DayTotals[] }) {
  const data = toChartPoints(days);
  const isEmpty = data.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last 30 days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          {isEmpty ? (
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border-secondary text-sm text-muted-foreground">
              No data to chart yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: 8, right: 16, top: 8 }}>
                <CartesianGrid
                  stroke="hsl(var(--border))"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="short"
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 11,
                  }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis
                  yAxisId="kcal"
                  orientation="left"
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <YAxis
                  yAxisId="protein"
                  orientation="right"
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={tooltipFormatter}
                />
                <Line
                  yAxisId="kcal"
                  type="monotone"
                  dataKey="kcal"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="protein"
                  type="monotone"
                  dataKey="proteinG"
                  stroke="hsl(var(--one-yellow))"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        {!isEmpty ? (
          <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-0.5 w-6 rounded-full bg-foreground"
              />
              Calories
            </span>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-0.5 w-6 rounded-full bg-brand-yellow"
              />
              Protein (g)
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
