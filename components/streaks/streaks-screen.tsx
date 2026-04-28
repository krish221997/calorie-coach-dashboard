"use client";

import * as React from "react";
import { CC, Kicker, Panel, Telemetry } from "@/components/ui";
import type { DailyTargets, DayTotals } from "@/types/meals";
import { DotGrid } from "./dot-grid";
import { MissionClock } from "./mission-clock";

export interface StreaksScreenProps {
  DAYS: DayTotals[];
  TARGETS: DailyTargets;
  streak: number;
}

function longestStreak(days: DayTotals[]): number {
  let best = 0;
  let cur = 0;
  for (const d of days) {
    if (d.mealCount > 0) {
      cur++;
      best = Math.max(best, cur);
    } else {
      cur = 0;
    }
  }
  return best;
}

export function StreaksScreen({
  DAYS,
  TARGETS,
  streak,
}: StreaksScreenProps) {
  const days90 = DAYS.slice(0, 90);
  const logged90 = days90.filter((d) => d.mealCount > 0).length;
  const longest = React.useMemo(() => longestStreak(days90), [days90]);
  const avgMeals = Number(
    (days90.reduce((s, d) => s + d.mealCount, 0) / 90).toFixed(1)
  );

  return (
    <div
      className="cc-screen"
      style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}
    >
      <Header streak={streak} logged={logged90} />

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
        <Panel id="01" title="MISSION CLOCK · CURRENT STREAK" pad={32}>
          <MissionClock streak={streak} />
        </Panel>
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr 1fr", gap: 14 }}>
          <Panel id="02" title="LONGEST STREAK · 90d">
            <Telemetry value={longest} unit="days" size={52} mono color={CC.yellow} />
          </Panel>
          <Panel id="03" title="LOG RATE · 90d">
            <Telemetry
              value={Math.round((logged90 / 90) * 100)}
              unit="%"
              size={52}
              mono
            />
            <LogRateBar pct={logged90 / 90} />
          </Panel>
          <Panel id="04" title="AVG MEALS / DAY">
            <Telemetry value={avgMeals} size={52} mono />
          </Panel>
        </div>
      </div>

      <Panel
        id="05"
        title="90-DAY LEDGER · ONE DOT PER DAY"
        right="◉ LOGGED · ○ SKIPPED"
      >
        <DotGrid days={days90} target={TARGETS.kcal} />
      </Panel>
    </div>
  );
}

function Header({ streak, logged }: { streak: number; logged: number }) {
  return (
    <div>
      <Kicker>CONSISTENCY · T−90d · MISSION CLOCK</Kicker>
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
        {streak} days unbroken.{" "}
        <em style={{ color: CC.fg2 }}>
          {logged} of the last 90 logged.
        </em>
      </div>
    </div>
  );
}

function LogRateBar({ pct }: { pct: number }) {
  return (
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
          width: `${pct * 100}%`,
          background: CC.green,
        }}
      />
    </div>
  );
}
