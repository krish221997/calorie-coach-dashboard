"use client";

import * as React from "react";
import { fmtDate } from "@/lib/time";
import { CC, Kicker, Panel } from "@/components/ui";
import type { DailyTargets, DayTotals } from "@/types/meals";
import { AnomalyLog } from "./anomaly-log";
import { BigStat } from "./big-stat";
import { Heatmap } from "./heatmap";
import { KcalChart } from "./kcal-chart";
import { MacroStack } from "./macro-stack";
import { MacroStackLegend } from "./macro-stack-legend";

export interface ReviewScreenProps {
  DAYS: DayTotals[];
  TARGETS: DailyTargets;
}

export function ReviewScreen({ DAYS, TARGETS }: ReviewScreenProps) {
  const [hover, setHover] = React.useState<DayTotals | null>(null);
  const days = DAYS.slice(0, 30).slice().reverse();
  // Only days with actual logs count toward stats. Days with mealCount===0
  // are gaps (user didn't log), not "low-ingest days."
  const loggedDays = days.filter((d) => d.mealCount > 0);
  const gaps = days.length - loggedDays.length;

  const avg = (k: keyof DayTotals) =>
    Math.round(
      loggedDays.reduce((s, d) => s + (d[k] as number), 0) /
        Math.max(1, loggedDays.length)
    );
  const maxK = Math.max(0, ...loggedDays.map((d) => d.kcal));
  const onTarget = loggedDays.filter(
    (d) => Math.abs(d.kcal - TARGETS.kcal) < TARGETS.kcal * 0.12
  ).length;
  const anomalies = loggedDays.filter(
    (d) => d.kcal < TARGETS.kcal * 0.5 || d.kcal > TARGETS.kcal * 1.3
  );

  return (
    <div
      className="cc-screen"
      style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}
    >
      <Header onTarget={onTarget} anomalies={anomalies.length} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 14,
        }}
      >
        <BigStat id="01" label="AVG · KCAL/DAY" value={avg("kcal")} />
        <BigStat id="02" label="AVG · PROTEIN" value={avg("proteinG")} unit="g" />
        <BigStat id="03" label="PEAK · MAX" value={maxK} unit="kcal" />
        <BigStat
          id="04"
          label="DAYS ON TARGET"
          value={`${onTarget}/${loggedDays.length}`}
          tone="good"
        />
        <BigStat
          id="05"
          label={gaps > 0 ? `ANOMALIES · ${gaps} UNLOGGED` : "ANOMALIES"}
          value={anomalies.length}
          tone={anomalies.length > 3 ? "warn" : "ok"}
        />
      </div>

      <Panel
        id="06"
        title="KCAL · 30-DAY ALTITUDE PROFILE"
        right={
          hover
            ? `${fmtDate(hover.date + "T00:00")} · ${hover.kcal}`
            : "HOVER FOR DETAIL"
        }
      >
        <KcalChart
          days={loggedDays}
          onHover={setHover}
          anomalies={anomalies}
          target={TARGETS.kcal}
        />
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
        <Panel
          id="07"
          title="MACRO COMPOSITION · STACKED"
          right={<MacroStackLegend />}
        >
          <MacroStack days={loggedDays} />
        </Panel>
        <Panel id="08" title="ANOMALY LOG" right={`${anomalies.length} FLAGGED`}>
          <AnomalyLog anomalies={anomalies} targetKcal={TARGETS.kcal} />
        </Panel>
      </div>

      <Panel id="09" title="WEEKDAY · HEATMAP · AVG KCAL BY DAY-OF-WEEK">
        <Heatmap days={loggedDays} />
      </Panel>
    </div>
  );
}

function Header({
  onTarget,
  anomalies,
}: {
  onTarget: number;
  anomalies: number;
}) {
  return (
    <div>
      <Kicker>REVIEW · T−30d → T+0 · MISSION CHART ROOM</Kicker>
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
        Thirty days,{" "}
        <em style={{ color: CC.fg2 }}>
          {onTarget} on target, {anomalies} flagged.
        </em>
      </div>
    </div>
  );
}
