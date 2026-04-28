"use client";

import * as React from "react";
import { CC, Kicker, Panel } from "@/components/ui";
import type { DayTotals } from "@/types/meals";
import { Reticule } from "./reticule";

export interface IdleScreenProps {
  DAYS: DayTotals[];
}

function computeStreak(days: DayTotals[]): number {
  let n = 0;
  for (const d of days) {
    if (d.mealCount > 0) n++;
    else break;
  }
  return n;
}

export function IdleScreen({ DAYS }: IdleScreenProps) {
  const last7 = DAYS.slice(0, 7);
  const avgKcal = Math.round(
    last7.reduce((s, d) => s + d.kcal, 0) / Math.max(1, last7.length)
  );
  const avgProtein = Math.round(
    last7.reduce((s, d) => s + d.proteinG, 0) / Math.max(1, last7.length)
  );
  const avgMeals = (
    last7.reduce((s, d) => s + d.mealCount, 0) / Math.max(1, last7.length)
  ).toFixed(1);
  const streak = computeStreak(DAYS);

  return (
    <div
      className="cc-screen"
      style={{
        position: "relative",
        minHeight: "calc(100vh - 52px)",
        overflow: "hidden",
      }}
    >
      <Scanline />
      <Header />
      <Reticule />
      <FooterPanels
        avgKcal={avgKcal}
        avgProtein={avgProtein}
        avgMeals={avgMeals}
        streak={streak}
      />
    </div>
  );
}

function Scanline() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: `linear-gradient(180deg,
          color-mix(in srgb, var(--cc-yellow) 0%, transparent),
          color-mix(in srgb, var(--cc-yellow) 55%, transparent),
          color-mix(in srgb, var(--cc-yellow) 0%, transparent))`,
        boxShadow:
          "0 0 14px color-mix(in srgb, var(--cc-yellow) 45%, transparent)",
        animation: "ccScanline 6s linear infinite",
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}

function Header() {
  return (
    <div style={{ padding: "48px 40px 32px", position: "relative" }}>
      <Kicker>STATION · IDLE · T+00:00:00 · NO TELEMETRY</Kicker>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 120,
          lineHeight: 0.88,
          letterSpacing: "-0.03em",
          marginTop: 16,
          color: CC.fg,
          maxWidth: 1100,
        }}
      >
        Standing by.
        <br />
        <em style={{ color: CC.fg2 }}>No events today.</em>
      </div>
    </div>
  );
}

function FooterPanels({
  avgKcal,
  avgProtein,
  avgMeals,
  streak,
}: {
  avgKcal: number;
  avgProtein: number;
  avgMeals: string;
  streak: number;
}) {
  return (
    <div
      style={{
        padding: "0 40px 40px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 20,
      }}
    >
      <Panel id="01" title="CHANNEL · TELEGRAM">
        <ChannelStatus />
      </Panel>
      <Panel id="02" title="HOW TO BEGIN">
        <HowToBegin />
      </Panel>
      <Panel id="03" title="LAST 7 DAYS · AVG">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Metric label="KCAL" v={avgKcal} />
          <Metric label="PROTEIN" v={avgProtein} unit="g" />
          <Metric label="MEALS" v={avgMeals} />
          <Metric label="STREAK" v={streak} unit="d" />
        </div>
      </Panel>
    </div>
  );
}

function ChannelStatus() {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        lineHeight: 1.9,
        color: CC.fg2,
      }}
    >
      <span style={{ color: CC.green }}>&gt;</span> agent online
      <br />
      <span style={{ color: CC.green }}>&gt;</span> notion linked
      <br />
      <span style={{ color: CC.green }}>&gt;</span> one linked
      <br />
      <span style={{ color: CC.yellow }}>&gt;</span> waiting for first event
      <span className="cc-cursor">_</span>
    </div>
  );
}

function HowToBegin() {
  const botHandle =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_HANDLE || "your Telegram bot";
  return (
    <div style={{ fontSize: 13, color: CC.fg2, lineHeight: 1.6 }}>
      Send a message, a voice note, or a photo of your meal to{" "}
      <span style={{ color: CC.yellow, fontFamily: "var(--font-mono)" }}>
        {botHandle}
      </span>
      . It will appear here within seconds.
    </div>
  );
}

function Metric({
  label,
  v,
  unit,
}: {
  label: string;
  v: number | string;
  unit?: string;
}) {
  return (
    <div style={{ borderTop: `1px solid ${CC.border}`, paddingTop: 8 }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: CC.fg3,
          letterSpacing: "0.18em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 22,
          color: CC.fg,
          marginTop: 4,
        }}
      >
        {v}
        {unit ? (
          <span style={{ fontSize: 11, color: CC.fg2, marginLeft: 3 }}>
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}
