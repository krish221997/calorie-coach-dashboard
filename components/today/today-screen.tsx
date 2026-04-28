"use client";

import * as React from "react";
import { TZ, fmtTime, istHourFraction } from "@/lib/time";
import { CC, Kicker, Panel, Telemetry } from "@/components/ui";
import type { DailyTargets, DayTotals, Meal } from "@/types/meals";
import { AltitudeChart, type AltitudePoint } from "./altitude-chart";
import { ChannelStack } from "./channel-stack";
import { EventLog } from "./event-log";
import { HeroSentence } from "./hero-sentence";
import { MacroReadout } from "./macro-readout";
import { MacroRing } from "./macro-ring";

export interface TodayScreenProps {
  todayTotals: DayTotals;
  todayMeals: Meal[];
  TARGETS: DailyTargets;
}

export function TodayScreen({ todayTotals, todayMeals, TARGETS }: TodayScreenProps) {
  const pct = TARGETS.kcal > 0 ? todayTotals.kcal / TARGETS.kcal : 0;
  const cumPoints = buildCumulativePoints(todayMeals);
  const dateLabel = new Date().toLocaleDateString("en-GB", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="cc-screen"
      style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}
    >
      <div>
        <Kicker>PRIMARY DISPLAY · T+TODAY · {dateLabel}</Kicker>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 64,
            lineHeight: 0.95,
            letterSpacing: "-0.025em",
            marginTop: 10,
            marginBottom: 0,
            color: CC.fg,
            maxWidth: 900,
            fontWeight: 400,
          }}
        >
          <HeroSentence meals={todayMeals} />
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        <PrimaryKcalPanel
          totals={todayTotals}
          targets={TARGETS}
          pct={pct}
          cumPoints={cumPoints}
        />
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr 1fr", gap: 14 }}>
          <MacroReadout
            id="02"
            label="PROTEIN"
            value={Math.round(todayTotals.proteinG)}
            target={TARGETS.proteinG}
            unit="g"
            color={CC.yellow}
          />
          <MacroReadout
            id="03"
            label="FAT"
            value={Math.round(todayTotals.fatG)}
            target={TARGETS.fatG}
            unit="g"
            color={CC.blue}
          />
          <MacroReadout
            id="04"
            label="CARBS"
            value={Math.round(todayTotals.carbsG)}
            target={TARGETS.carbsG}
            unit="g"
            color={CC.green}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        <Panel
          id="05"
          title="EVENT LOG · TODAY"
          right={`${todayMeals.length} EVENTS`}
        >
          <EventLog meals={todayMeals} />
        </Panel>
        <Panel id="06" title="INPUT CHANNELS · 24H" right="TELEGRAM · LIVE">
          <ChannelStack meals={todayMeals} />
          <ChannelFooter meals={todayMeals} />
        </Panel>
      </div>
    </div>
  );
}

function PrimaryKcalPanel({
  totals,
  targets,
  pct,
  cumPoints,
}: {
  totals: DayTotals;
  targets: DailyTargets;
  pct: number;
  cumPoints: AltitudePoint[];
}) {
  return (
    <Panel
      id="01"
      title="PRIMARY · KCAL"
      right={`${Math.round(pct * 100)}% OF TARGET`}
      pad={28}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Telemetry value={totals.kcal} unit="kcal" size={144} jitter />
          <div
            style={{
              marginTop: 12,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: CC.fg2,
              letterSpacing: "0.1em",
            }}
          >
            Δ +{Math.max(0, targets.kcal - totals.kcal)} REMAINING · TARGET{" "}
            {targets.kcal.toLocaleString()}
          </div>
        </div>
        <MacroRing pct={pct} />
      </div>
      <AltitudeChart points={cumPoints} target={targets.kcal} />
    </Panel>
  );
}

function ChannelFooter({ meals }: { meals: Meal[] }) {
  const lastTs = meals[meals.length - 1]?.timestamp;
  return (
    <div
      style={{
        marginTop: 18,
        padding: 14,
        border: `1px dashed ${CC.border}`,
        borderRadius: 3,
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: CC.fg2,
        lineHeight: 1.7,
      }}
    >
      <span style={{ color: CC.green }}>&gt;</span> agent online
      <br />
      <span style={{ color: CC.green }}>&gt;</span> last ingest · T+
      {lastTs ? fmtTime(lastTs) : "--:--"}
      <br />
      <span style={{ color: CC.yellow }}>&gt;</span> awaiting next event
      <span className="cc-cursor">_</span>
    </div>
  );
}

function buildCumulativePoints(meals: Meal[]) {
  let cum = 0;
  return meals.map((m) => {
    cum += m.kcal;
    return {
      x: istHourFraction(m.timestamp),
      y: cum,
      id: m.id,
      items: m.items || m.title || "—",
      kcal: m.kcal,
      timeLabel: fmtTime(m.timestamp),
    };
  });
}
