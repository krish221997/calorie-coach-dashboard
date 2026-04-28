"use client";

import * as React from "react";
import { CC } from "@/components/ui";
import type { DayTotals } from "@/types/meals";

const W = 1200;
const H = 240;
const TOP_PAD = 18;
const BOT_PAD = 28;

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

interface HoverState {
  index: number;
  cx: number;
}

export function CompareChart({
  thisWeek,
  lastWeek,
  target,
}: {
  thisWeek: DayTotals[];
  lastWeek: DayTotals[];
  target: number;
}) {
  const [hover, setHover] = React.useState<HoverState | null>(null);

  const max =
    Math.max(
      ...thisWeek.map((d) => d.kcal),
      ...lastWeek.map((d) => d.kcal),
      target,
      1
    ) * 1.1;
  const innerH = H - TOP_PAD - BOT_PAD;
  const step = W / 6;

  const xy = (d: DayTotals, i: number): [number, number] => [
    i * step,
    TOP_PAD + (innerH - (d.kcal / max) * innerH),
  ];

  const path = (arr: DayTotals[]) =>
    "M " + arr.map((d, i) => xy(d, i).join(",")).join(" L ");

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: H, display: "block" }}
        onMouseLeave={() => setHover(null)}
      >
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1="0"
            x2={W}
            y1={TOP_PAD + innerH * p}
            y2={TOP_PAD + innerH * p}
            stroke={CC.gridLine}
          />
        ))}
        <line
          x1="0"
          x2={W}
          y1={TOP_PAD + innerH - (target / max) * innerH}
          y2={TOP_PAD + innerH - (target / max) * innerH}
          stroke={CC.yellow}
          strokeOpacity="0.3"
          strokeDasharray="4 6"
        />

        <path
          d={path(lastWeek)}
          fill="none"
          stroke={CC.fg3}
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <path
          d={path(thisWeek)}
          fill="none"
          stroke={CC.yellow}
          strokeWidth="2"
        />

        {thisWeek.map((d, i) => {
          const [x, y] = xy(d, i);
          const isHover = hover?.index === i;
          return (
            <g
              key={"t" + i}
              onMouseEnter={() => setHover({ index: i, cx: x })}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x - step / 2}
                y={0}
                width={step}
                height={H}
                fill="transparent"
              />
              <circle cx={x} cy={y} r={isHover ? 6 : 4} fill={CC.yellow} />
              {isHover ? (
                <circle
                  cx={x}
                  cy={y}
                  r="11"
                  fill="none"
                  stroke={CC.yellow}
                  strokeOpacity="0.4"
                />
              ) : null}
            </g>
          );
        })}
        {lastWeek.map((d, i) => {
          const [x, y] = xy(d, i);
          return (
            <circle
              key={"l" + i}
              cx={x}
              cy={y}
              r="3"
              fill="none"
              stroke={CC.fg3}
            />
          );
        })}

        {hover ? (
          <line
            x1={hover.cx}
            x2={hover.cx}
            y1={TOP_PAD}
            y2={H - BOT_PAD}
            stroke={CC.fg2}
            strokeOpacity="0.35"
            strokeDasharray="2 3"
          />
        ) : null}

        {DAY_NAMES.map((n, i) => (
          <text
            key={n}
            x={i * step}
            y={H - 6}
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill={CC.fg3}
            letterSpacing="2"
            textAnchor={i === 0 ? "start" : i === 6 ? "end" : "middle"}
          >
            {n}
          </text>
        ))}
      </svg>

      {hover ? (
        <Tooltip
          dayLabel={DAY_NAMES[hover.index]}
          thisKcal={thisWeek[hover.index]?.kcal ?? 0}
          lastKcal={lastWeek[hover.index]?.kcal ?? 0}
          cx={hover.cx}
        />
      ) : null}
    </div>
  );
}

function Tooltip({
  dayLabel,
  thisKcal,
  lastKcal,
  cx,
}: {
  dayLabel: string;
  thisKcal: number;
  lastKcal: number;
  cx: number;
}) {
  const delta = thisKcal - lastKcal;
  const pct = lastKcal ? Math.round((delta / lastKcal) * 100) : 0;
  const left = `${(cx / W) * 100}%`;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: 4,
        transform: "translateX(-50%)",
        pointerEvents: "none",
        background: CC.cardSolid,
        border: `1px solid ${CC.borderStrong}`,
        borderRadius: 4,
        padding: "10px 12px",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: CC.fg,
        minWidth: 180,
        boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ color: CC.fg2, letterSpacing: "0.18em", marginBottom: 6 }}>
        {dayLabel}
      </div>
      <Row color={CC.yellow} label="this week" v={thisKcal} />
      <Row color={CC.fg3} label="last week" v={lastKcal} dashed />
      <div
        style={{
          marginTop: 6,
          paddingTop: 6,
          borderTop: `1px solid ${CC.border}`,
          color: delta > 0 ? CC.green : delta < 0 ? CC.red : CC.fg2,
        }}
      >
        Δ {delta >= 0 ? "+" : ""}
        {delta} kcal · {pct >= 0 ? "+" : ""}
        {pct}%
      </div>
    </div>
  );
}

function Row({
  color,
  label,
  v,
  dashed,
}: {
  color: string;
  label: string;
  v: number;
  dashed?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "14px 1fr auto",
        gap: 8,
        alignItems: "center",
        padding: "2px 0",
      }}
    >
      <span
        style={{
          width: 12,
          height: 2,
          background: dashed ? "transparent" : color,
          borderTop: dashed ? `2px dashed ${color}` : undefined,
        }}
      />
      <span style={{ color: CC.fg2 }}>{label}</span>
      <span style={{ color: CC.fg }}>{v.toLocaleString()}</span>
    </div>
  );
}
