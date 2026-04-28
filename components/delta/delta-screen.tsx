"use client";

import * as React from "react";
import { fmtDate } from "@/lib/time";
import { CC, Kicker, Panel } from "@/components/ui";
import type { DailyTargets, DayTotals } from "@/types/meals";
import { BestWorst } from "./best-worst";
import { CompareChart } from "./compare-chart";
import { CompareLegend } from "./compare-legend";
import { DeltaStatCard } from "./delta-stat-card";
import { Narrative } from "./narrative";

export interface DeltaScreenProps {
  DAYS: DayTotals[];
  TARGETS: DailyTargets;
}

interface Row {
  key: keyof DayTotals;
  label: string;
  unit: string;
}

const ROWS: Row[] = [
  { key: "kcal", label: "KCAL · DAILY AVG", unit: "" },
  { key: "proteinG", label: "PROTEIN · AVG", unit: "g" },
  { key: "fatG", label: "FAT · AVG", unit: "g" },
  { key: "carbsG", label: "CARBS · AVG", unit: "g" },
  { key: "mealCount", label: "MEALS / DAY", unit: "" },
];

function metric(arr: DayTotals[], key: keyof DayTotals): number {
  return Math.round(
    arr.reduce((s, d) => s + (d[key] as number), 0) / Math.max(1, arr.length)
  );
}

function weekRange(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  const s = new Date(d);
  s.setDate(s.getDate() - 6);
  return `${fmtDate(s.toISOString())}–${fmtDate(d.toISOString())}`;
}

export function DeltaScreen({ DAYS, TARGETS }: DeltaScreenProps) {
  const thisWeek = DAYS.slice(0, 7);
  const lastWeek = DAYS.slice(7, 14);

  return (
    <div
      className="cc-screen"
      style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}
    >
      <Header />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 14,
        }}
      >
        {ROWS.map((r) => (
          <DeltaStatCard
            key={String(r.key)}
            label={r.label}
            current={metric(thisWeek, r.key)}
            previous={metric(lastWeek, r.key)}
            unit={r.unit}
          />
        ))}
      </div>

      <Panel
        id="06"
        title="DAY BY DAY · KCAL"
        right={<CompareLegend />}
      >
        <CompareChart
          thisWeek={thisWeek.slice().reverse()}
          lastWeek={lastWeek.slice().reverse()}
          target={TARGETS.kcal}
        />
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Panel id="07" title="NARRATIVE · COACH">
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 20,
              lineHeight: 1.55,
              color: CC.fg,
            }}
          >
            <Narrative thisWeek={thisWeek} lastWeek={lastWeek} />
          </div>
        </Panel>
        <Panel id="08" title="BEST DAY · WORST DAY">
          <BestWorst week={thisWeek} target={TARGETS.kcal} />
        </Panel>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <Kicker>
        DELTA · WEEK {weekRange(0)} vs WEEK {weekRange(7)}
      </Kicker>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 64,
          lineHeight: 0.95,
          letterSpacing: "-0.025em",
          marginTop: 10,
          color: CC.fg,
          maxWidth: 1100,
        }}
      >
        This week, against last.{" "}
        <em style={{ color: CC.fg2 }}>Tell me what changed.</em>
      </div>
    </div>
  );
}
