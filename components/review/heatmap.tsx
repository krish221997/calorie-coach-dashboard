import * as React from "react";
import { CC } from "@/components/ui";
import type { DayTotals } from "@/types/meals";

const NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function averageByWeekday(days: DayTotals[]): number[] {
  const byDow: number[][] = Array.from({ length: 7 }, () => []);
  for (const d of days) {
    const dow = new Date(d.date + "T00:00").getDay();
    byDow[dow].push(d.kcal);
  }
  return byDow.map((list) =>
    list.length ? Math.round(list.reduce((s, v) => s + v, 0) / list.length) : 0
  );
}

export function Heatmap({ days }: { days: DayTotals[] }) {
  const avgs = averageByWeekday(days);
  const max = Math.max(...avgs, 1);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 10,
      }}
    >
      {NAMES.map((n, i) => (
        <HeatmapCell key={n} name={n} value={avgs[i]} max={max} />
      ))}
    </div>
  );
}

function HeatmapCell({
  name,
  value,
  max,
}: {
  name: string;
  value: number;
  max: number;
}) {
  const intensity = value / max;
  return (
    <div
      style={{
        borderLeft: `2px solid ${CC.yellow}`,
        paddingLeft: 12,
        opacity: 0.5 + intensity * 0.5,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: CC.fg3,
          letterSpacing: "0.2em",
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 32,
          color: CC.fg,
          lineHeight: 1,
          marginTop: 6,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: CC.fg2,
          letterSpacing: "0.1em",
          marginTop: 4,
        }}
      >
        KCAL AVG
      </div>
      <div
        style={{
          marginTop: 10,
          height: 3,
          background: CC.border,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${intensity * 100}%`,
            background: CC.yellow,
          }}
        />
      </div>
    </div>
  );
}
