"use client";

import * as React from "react";
import Link from "next/link";
import { fmtTime } from "@/lib/time";
import { CC, Kicker, Panel } from "@/components/ui";
import type { Meal } from "@/types/meals";
import { Reticule } from "./reticule";

export interface StationActiveProps {
  todayMeals: Meal[];
  todayKcal: number;
  targetKcal: number;
}

const NAMES = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
];
function spell(n: number): string {
  if (n >= 0 && n < NAMES.length) return NAMES[n];
  return String(n);
}

export function StationActive({
  todayMeals,
  todayKcal,
  targetKcal,
}: StationActiveProps) {
  const lastTs = todayMeals[todayMeals.length - 1]?.timestamp;
  const last = lastTs ? fmtTime(lastTs) : "--:--";
  const remaining = Math.max(0, targetKcal - todayKcal);
  const pct = targetKcal > 0 ? Math.round((todayKcal / targetKcal) * 100) : 0;

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

      <div style={{ padding: "48px 40px 32px", position: "relative" }}>
        <Kicker>STATION · ACTIVE · TELEMETRY NOMINAL</Kicker>
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
          {spell(todayMeals.length)} plate
          {todayMeals.length === 1 ? "" : "s"}.
          <br />
          <em style={{ color: CC.fg2 }}>Last at {last}.</em>
        </div>
      </div>

      <Reticule kcal={todayKcal} statusLabel="ACTIVE" statusColor="green" />

      <div
        style={{
          padding: "0 40px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20,
        }}
      >
        <Panel id="01" title="CHANNEL · TELEGRAM">
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
            <span style={{ color: CC.green }}>&gt;</span> last ingest · T+{last}
            <br />
            <span style={{ color: CC.yellow }}>&gt;</span>{" "}
            {todayMeals.length} event{todayMeals.length === 1 ? "" : "s"}{" "}
            buffered
            <span className="cc-cursor">_</span>
          </div>
        </Panel>

        <Panel id="02" title="TODAY · PROGRESS">
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: CC.fg2,
              letterSpacing: "0.1em",
              lineHeight: 2,
            }}
          >
            <Stat label="LOGGED" value={`${todayKcal.toLocaleString()} kcal`} />
            <Stat label="TARGET" value={targetKcal.toLocaleString()} />
            <Stat label="REMAINING" value={`${remaining.toLocaleString()} kcal`} accent />
            <Stat label="ON TARGET" value={`${pct}%`} accent />
          </div>
        </Panel>

        <Panel id="03" title="WHAT NOW">
          <div style={{ fontSize: 13, color: CC.fg2, lineHeight: 1.6 }}>
            Live readout in{" "}
            <Link
              href="/"
              style={{ color: CC.yellow, fontFamily: "var(--font-mono)" }}
            >
              today
            </Link>
            . Full transcript in{" "}
            <Link
              href="/log"
              style={{ color: CC.yellow, fontFamily: "var(--font-mono)" }}
            >
              log
            </Link>
            . Trend in{" "}
            <Link
              href="/review"
              style={{ color: CC.yellow, fontFamily: "var(--font-mono)" }}
            >
              review
            </Link>
            .
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
      }}
    >
      <span style={{ color: CC.fg3, fontSize: 10, letterSpacing: "0.18em" }}>
        {label}
      </span>
      <span style={{ color: accent ? CC.yellow : CC.fg }}>{value}</span>
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
