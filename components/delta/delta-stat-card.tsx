import * as React from "react";
import { CC, Panel } from "@/components/ui";

export function DeltaStatCard({
  label,
  current,
  previous,
  unit,
}: {
  label: string;
  current: number;
  previous: number;
  unit: string;
}) {
  const delta = current - previous;
  const pct = previous ? Math.round((delta / previous) * 100) : 0;
  return (
    <Panel title={label}>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 44,
          color: CC.fg,
          lineHeight: 1,
        }}
      >
        {current}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: CC.fg2,
            marginLeft: 4,
          }}
        >
          {unit}
        </span>
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: delta > 0 ? CC.green : delta < 0 ? CC.red : CC.fg2,
          letterSpacing: "0.05em",
        }}
      >
        {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}
        {unit} · {pct >= 0 ? "+" : ""}
        {pct}%
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: CC.fg3,
          letterSpacing: "0.1em",
        }}
      >
        LAST WEEK · {previous}
        {unit}
      </div>
    </Panel>
  );
}
