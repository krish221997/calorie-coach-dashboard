import * as React from "react";
import { fmtDate } from "@/lib/time";
import { CC } from "@/components/ui";
import type { DayTotals } from "@/types/meals";

export function BestWorst({
  week,
  target,
}: {
  week: DayTotals[];
  target: number;
}) {
  if (week.length === 0) {
    return (
      <div
        style={{
          color: CC.fg2,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
      >
        No data this week yet.
      </div>
    );
  }

  const best = [...week].sort(
    (a, b) => Math.abs(a.kcal - target) - Math.abs(b.kcal - target)
  )[0];
  const worst = [...week].sort(
    (a, b) => Math.abs(b.kcal - target) - Math.abs(a.kcal - target)
  )[0];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <BestWorstCell
        label="NOMINAL · CLOSEST TO TARGET"
        day={best}
        target={target}
        color={CC.green}
      />
      <BestWorstCell
        label="ANOMALY · FURTHEST FROM TARGET"
        day={worst}
        target={target}
        color={CC.red}
      />
    </div>
  );
}

function BestWorstCell({
  label,
  day,
  target,
  color,
}: {
  label: string;
  day: DayTotals;
  target: number;
  color: string;
}) {
  const diff = day.kcal - target;
  return (
    <div style={{ borderLeft: `2px solid ${color}`, paddingLeft: 14 }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color,
          letterSpacing: "0.18em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 36,
          color: CC.fg,
          marginTop: 8,
        }}
      >
        {fmtDate(day.date + "T00:00", { weekday: "long" })}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: CC.fg2,
          letterSpacing: "0.08em",
          marginTop: 4,
        }}
      >
        {day.kcal} kcal · Δ {diff > 0 ? "+" : ""}
        {diff} from target
      </div>
    </div>
  );
}
