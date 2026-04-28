import * as React from "react";
import { fmtDate } from "@/lib/time";
import { CC } from "@/components/ui";
import type { DayTotals } from "@/types/meals";

export function AnomalyLog({
  anomalies,
  targetKcal,
}: {
  anomalies: DayTotals[];
  targetKcal: number;
}) {
  if (anomalies.length === 0) {
    return (
      <div
        style={{
          color: CC.fg2,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
      >
        No anomalies. All days within ±30% of target.
      </div>
    );
  }

  return (
    <>
      {anomalies.slice(0, 7).map((d) => (
        <AnomalyRow key={d.date} day={d} targetKcal={targetKcal} />
      ))}
    </>
  );
}

function AnomalyRow({
  day,
  targetKcal,
}: {
  day: DayTotals;
  targetKcal: number;
}) {
  const low = day.kcal < targetKcal * 0.5;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr 80px 80px",
        gap: 8,
        alignItems: "center",
        padding: "10px 0",
        borderBottom: `1px solid ${CC.border}`,
        fontFamily: "var(--font-mono)",
        fontSize: 12,
      }}
    >
      <span style={{ color: CC.fg2, letterSpacing: "0.1em" }}>
        {fmtDate(day.date + "T00:00")}
      </span>
      <span style={{ color: CC.fg }}>
        {low ? "Low-ingest day" : "High-ingest day"}
      </span>
      <span style={{ color: low ? CC.blue : CC.red, textAlign: "right" }}>
        {day.kcal}
      </span>
      <span style={{ color: CC.fg3, textAlign: "right" }}>
        {low ? "⚠ LOW" : "⚠ HIGH"}
      </span>
    </div>
  );
}
