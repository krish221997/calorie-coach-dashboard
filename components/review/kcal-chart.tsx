"use client";

import * as React from "react";
import { fmtDate } from "@/lib/time";
import { CC } from "@/components/ui";
import type { DayTotals } from "@/types/meals";

const W = 1200;
const H = 280;
const TOP_PAD = 18;
const BOT_PAD = 28;

interface HoverState {
  index: number;
  x: number;
  y: number;
  day: DayTotals;
  isAnomaly: boolean;
}

export function KcalChart({
  days,
  onHover,
  anomalies,
  target,
}: {
  days: DayTotals[];
  onHover: (d: DayTotals | null) => void;
  anomalies: DayTotals[];
  target: number;
}) {
  const [hover, setHover] = React.useState<HoverState | null>(null);
  const innerH = H - TOP_PAD - BOT_PAD;
  const max = Math.max(target * 1.4, ...days.map((d) => d.kcal), 1);
  const anomDates = new Set(anomalies.map((a) => a.date));
  const stepX = W / Math.max(1, days.length - 1);

  const pt = (d: DayTotals, i: number): [number, number] => [
    i * stepX,
    TOP_PAD + (innerH - (d.kcal / max) * innerH),
  ];

  const path = "M " + days.map((d, i) => pt(d, i).join(",")).join(" L ");
  const fill = path + ` L ${W} ${H - BOT_PAD} L 0 ${H - BOT_PAD} Z`;
  const targetY = TOP_PAD + (innerH - (target / max) * innerH);

  const setHoverFor = (d: DayTotals, i: number) => {
    const [x, y] = pt(d, i);
    const next = { index: i, x, y, day: d, isAnomaly: anomDates.has(d.date) };
    setHover(next);
    onHover(d);
  };

  const clearHover = () => {
    setHover(null);
    onHover(null);
  };

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: H, display: "block" }}
        onMouseLeave={clearHover}
      >
        <defs>
          <linearGradient id="review-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={CC.yellow} stopOpacity="0.35" />
            <stop offset="100%" stopColor={CC.yellow} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal gridlines */}
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

        {/* target line */}
        <line
          x1="0"
          x2={W}
          y1={targetY}
          y2={targetY}
          stroke={CC.yellow}
          strokeOpacity="0.45"
          strokeDasharray="4 6"
        />

        <path d={fill} fill="url(#review-fill)" />
        <path d={path} fill="none" stroke={CC.yellow} strokeWidth="1.5" />

        {/* hit areas + dots */}
        {days.map((d, i) => {
          const [x, y] = pt(d, i);
          const isAnom = anomDates.has(d.date);
          const isHover = hover?.index === i;
          return (
            <g
              key={d.date}
              onMouseEnter={() => setHoverFor(d, i)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x - stepX / 2}
                y={0}
                width={stepX}
                height={H}
                fill="transparent"
              />
              <circle
                cx={x}
                cy={y}
                r={isHover ? 6 : isAnom ? 5 : 3}
                fill={isAnom ? CC.red : CC.yellow}
              />
              {isAnom && (
                <circle
                  cx={x}
                  cy={y}
                  r="10"
                  fill="none"
                  stroke={CC.red}
                  strokeOpacity="0.5"
                />
              )}
              {isHover ? (
                <circle
                  cx={x}
                  cy={y}
                  r="11"
                  fill="none"
                  stroke={isAnom ? CC.red : CC.yellow}
                  strokeOpacity="0.55"
                />
              ) : null}
            </g>
          );
        })}

        {/* hover crosshair */}
        {hover ? (
          <line
            x1={hover.x}
            x2={hover.x}
            y1={TOP_PAD}
            y2={H - BOT_PAD}
            stroke={CC.fg2}
            strokeOpacity="0.4"
            strokeDasharray="2 3"
          />
        ) : null}
      </svg>

      <AxisLabels first={days[0]?.date} last={days[days.length - 1]?.date} />

      {hover ? <Tooltip hover={hover} target={target} /> : null}
    </div>
  );
}

function Tooltip({ hover, target }: { hover: HoverState; target: number }) {
  const left = `${(hover.x / W) * 100}%`;
  const delta = hover.day.kcal - target;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: 6,
        transform: "translateX(-50%)",
        pointerEvents: "none",
        background: CC.cardSolid,
        border: `1px solid ${hover.isAnomaly ? CC.red : CC.borderStrong}`,
        borderRadius: 4,
        padding: "10px 12px",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: CC.fg,
        minWidth: 220,
        boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
        zIndex: 5,
      }}
    >
      <div style={{ color: CC.fg2, marginBottom: 4 }}>
        {fmtDate(hover.day.date + "T00:00", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })}
      </div>
      <div
        style={{
          color: hover.isAnomaly ? CC.red : CC.yellow,
          fontSize: 18,
          fontWeight: 500,
        }}
      >
        {hover.day.kcal.toLocaleString()}{" "}
        <span style={{ color: CC.fg3, fontSize: 10 }}>kcal</span>
      </div>
      <div style={{ marginTop: 6, display: "grid", rowGap: 3, color: CC.fg2 }}>
        <Row label="protein" v={hover.day.proteinG} unit="g" color={CC.yellow} />
        <Row label="fat" v={hover.day.fatG} unit="g" color={CC.blue} />
        <Row label="carbs" v={hover.day.carbsG} unit="g" color={CC.green} />
        <Row label="meals" v={hover.day.mealCount} />
      </div>
      <div
        style={{
          marginTop: 6,
          paddingTop: 6,
          borderTop: `1px solid ${CC.border}`,
          color: delta > 0 ? CC.green : delta < 0 ? CC.red : CC.fg2,
        }}
      >
        Δ {delta >= 0 ? "+" : ""}
        {delta} from target
      </div>
    </div>
  );
}

function Row({
  label,
  v,
  unit,
  color,
}: {
  label: string;
  v: number;
  unit?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "10px 1fr auto",
        gap: 8,
        alignItems: "center",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          background: color ?? "transparent",
          borderRadius: 1,
          opacity: color ? 1 : 0,
        }}
      />
      <span style={{ color: CC.fg2 }}>{label}</span>
      <span style={{ color: CC.fg }}>
        {v}
        {unit ?? ""}
      </span>
    </div>
  );
}

function AxisLabels({ first, last }: { first?: string; last?: string }) {
  return (
    <div
      style={{
        marginTop: 8,
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        color: CC.fg3,
        letterSpacing: "0.12em",
      }}
    >
      <span>
        {first ? `T−${15}d · ${fmtDate(first + "T00:00")}` : "—"}
      </span>
      <span>T−7d</span>
      <span>{last ? `T+0 · ${fmtDate(last + "T00:00")}` : "TODAY"}</span>
    </div>
  );
}
