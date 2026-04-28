"use client";

import * as React from "react";
import { fmtDate } from "@/lib/time";
import { CC } from "@/components/ui";
import type { DayTotals } from "@/types/meals";

const W = 1000;
const H = 220;
const TOP_PAD = 18;
const BOT_PAD = 28;
const BAR_GAP = 6;

interface BarMetrics {
  day: DayTotals;
  x: number;
  width: number;
  total: number;
  proteinKcal: number;
  fatKcal: number;
  carbsKcal: number;
}

export function MacroStack({ days }: { days: DayTotals[] }) {
  const [hover, setHover] = React.useState<{
    bar: BarMetrics;
    cx: number;
  } | null>(null);

  if (days.length === 0) return <Empty />;

  const slot = W / days.length;
  const barWidth = Math.max(8, slot - BAR_GAP);
  const innerH = H - TOP_PAD - BOT_PAD;
  const maxKcal = Math.max(...days.map((d) => d.kcal), 1);

  const bars: BarMetrics[] = days.map((d, i) => ({
    day: d,
    x: i * slot + (slot - barWidth) / 2,
    width: barWidth,
    total: d.kcal,
    proteinKcal: d.proteinG * 4,
    fatKcal: d.fatG * 9,
    carbsKcal: d.carbsG * 4,
  }));

  const tickEvery = days.length > 18 ? 5 : days.length > 10 ? 3 : 2;

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: H, display: "block" }}
        onMouseLeave={() => setHover(null)}
      >
        {/* horizontal gridlines (faint) */}
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

        {bars.map((b, i) => {
          const barH = (b.total / maxKcal) * innerH;
          const yBase = TOP_PAD + (innerH - barH);
          // proportional segment heights
          const cH = b.total > 0 ? (b.carbsKcal / b.total) * barH : 0;
          const fH = b.total > 0 ? (b.fatKcal / b.total) * barH : 0;
          const pH = b.total > 0 ? (b.proteinKcal / b.total) * barH : 0;
          const isHover = hover?.bar.day.date === b.day.date;
          // Draw bottom→top: carbs (green) sits at bottom, fat (blue) middle, protein (yellow) top
          const yCarbs = TOP_PAD + innerH - cH;
          const yFat = yCarbs - fH;
          const yProtein = yFat - pH;

          return (
            <g
              key={b.day.date}
              onMouseEnter={() => setHover({ bar: b, cx: b.x + b.width / 2 })}
              style={{ cursor: "pointer" }}
            >
              {/* Hit target — full slot height for easy hover */}
              <rect
                x={i * slot}
                y={0}
                width={slot}
                height={H}
                fill="transparent"
              />
              {/* Carbs (bottom, green) */}
              <rect
                x={b.x}
                y={yCarbs}
                width={b.width}
                height={cH}
                fill={CC.green}
                opacity={isHover ? 0.95 : 0.75}
                rx="2"
              />
              {/* Fat (middle, blue) */}
              <rect
                x={b.x}
                y={yFat}
                width={b.width}
                height={fH}
                fill={CC.blue}
                opacity={isHover ? 0.95 : 0.75}
                rx="2"
              />
              {/* Protein (top, yellow) — small cap */}
              <rect
                x={b.x}
                y={yProtein}
                width={b.width}
                height={pH}
                fill={CC.yellow}
                opacity={isHover ? 1 : 0.85}
                rx="2"
              />
              {isHover ? (
                <line
                  x1={b.x + b.width / 2}
                  x2={b.x + b.width / 2}
                  y1={TOP_PAD}
                  y2={H - BOT_PAD}
                  stroke={CC.fg2}
                  strokeOpacity="0.4"
                  strokeDasharray="2 3"
                />
              ) : null}
            </g>
          );
        })}

        {/* x-axis labels */}
        {bars.map((b, i) =>
          i % tickEvery === 0 || i === bars.length - 1 ? (
            <text
              key={`lbl-${i}`}
              x={b.x + b.width / 2}
              y={H - 8}
              fontFamily="var(--font-mono)"
              fontSize="9"
              fill={CC.fg3}
              letterSpacing="2"
              textAnchor="middle"
            >
              {fmtDate(b.day.date + "T00:00", {
                day: "numeric",
                month: "short",
              })
                .toUpperCase()
                .replace(" ", " ")}
            </text>
          ) : null
        )}
      </svg>

      {hover ? <Tooltip metrics={hover.bar} cx={hover.cx} /> : null}
    </div>
  );
}

function Tooltip({ metrics, cx }: { metrics: BarMetrics; cx: number }) {
  const left = `${(cx / W) * 100}%`;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: 6,
        transform: "translateX(-50%)",
        pointerEvents: "none",
        background: CC.cardSolid,
        border: `1px solid ${CC.borderStrong}`,
        borderRadius: 4,
        padding: "10px 12px",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: CC.fg,
        letterSpacing: "0.05em",
        minWidth: 200,
        boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ color: CC.fg2, marginBottom: 6 }}>
        {fmtDate(metrics.day.date + "T00:00", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })}
      </div>
      <div style={{ color: CC.yellow, fontSize: 18, fontWeight: 500 }}>
        {metrics.day.kcal.toLocaleString()}{" "}
        <span style={{ color: CC.fg3, fontSize: 10 }}>kcal</span>
      </div>
      <div style={{ marginTop: 8, display: "grid", rowGap: 3 }}>
        <Row color={CC.yellow} label="protein" v={metrics.day.proteinG} />
        <Row color={CC.blue} label="fat" v={metrics.day.fatG} />
        <Row color={CC.green} label="carbs" v={metrics.day.carbsG} />
      </div>
    </div>
  );
}

function Row({
  color,
  label,
  v,
}: {
  color: string;
  label: string;
  v: number;
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
        style={{ width: 8, height: 8, background: color, borderRadius: 1 }}
      />
      <span style={{ color: CC.fg2 }}>{label}</span>
      <span style={{ color: CC.fg }}>{v}g</span>
    </div>
  );
}

function Empty() {
  return (
    <div
      style={{
        height: H,
        display: "grid",
        placeItems: "center",
        color: CC.fg3,
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}
    >
      — no logged days —
    </div>
  );
}
