import * as React from "react";
import { DARK } from "./tokens";

/**
 * Cumulative-intake area chart ("altitude" over the day) shown below
 * PRIMARY · KCAL. SVG viewBox stretches to fill whatever width the caller
 * gives it. The dashed line is the daily target plotted as a constant.
 */
export function AltitudeChart({
  meals,
  target,
}: {
  meals: { timestamp: string; kcal: number }[];
  target: number;
}) {
  const timeline = meals
    .filter((m) => m.timestamp)
    .map((m) => {
      const d = new Date(m.timestamp);
      return {
        x: (d.getHours() + d.getMinutes() / 60) / 24,
        kcal: m.kcal,
      };
    })
    .sort((a, b) => a.x - b.x);

  let cum = 0;
  const cumPoints = timeline.map((p) => {
    cum += p.kcal;
    return { x: p.x, y: cum };
  });

  const W = 1000;
  const H = 180;
  const topPad = 20;
  const safeTarget = target > 0 ? target : 1;
  // Target line — scale so target sits ~top of chart.
  const targetY = 30;
  const heightPx = H - targetY;

  const project = (y: number) =>
    H - (y / safeTarget) * heightPx;

  const fillPts: [number, number][] = [
    [0, H],
    ...cumPoints.map((p) => [p.x * W, project(p.y)] as [number, number]),
    [W, H],
  ];
  const fillD = `M ${fillPts.map((p) => p.join(",")).join(" L ")}`;
  const strokeD =
    cumPoints.length > 0
      ? `M ${cumPoints
          .map((p) => `${p.x * W},${project(p.y)}`)
          .join(" L ")}`
      : "";

  return (
    <div
      style={{
        marginTop: 28,
        height: 180,
        position: "relative",
        borderTop: `1px solid ${DARK.cardBorder}`,
        borderBottom: `1px solid ${DARK.cardBorder}`,
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="kcalGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={DARK.yellow} stopOpacity="0.35" />
            <stop offset="100%" stopColor={DARK.yellow} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1={targetY}
          x2={W}
          y2={targetY}
          stroke={DARK.yellow}
          strokeOpacity="0.35"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        {cumPoints.length > 0 ? (
          <>
            <path d={fillD} fill="url(#kcalGrad)" />
            <path
              d={strokeD}
              fill="none"
              stroke={DARK.yellow}
              strokeWidth="1.5"
            />
            {cumPoints.map((p, i) => (
              <circle
                key={i}
                cx={p.x * W}
                cy={project(p.y)}
                r="3"
                fill={DARK.yellow}
              />
            ))}
          </>
        ) : null}
        {/* keep topPad referenced so linter doesn't complain when axis labels change */}
        <g style={{ opacity: 0 }} transform={`translate(0 ${topPad})`} />
      </svg>
      <div
        style={{
          position: "absolute",
          bottom: -18,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: DARK.fg3,
          letterSpacing: "0.1em",
        }}
      >
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}

/**
 * 30-day kcal bar strip — today highlighted in brand yellow.
 */
export function TrendStrip({
  days,
}: {
  days: { date: string; kcal: number }[];
}) {
  const maxK = Math.max(1, ...days.map((d) => d.kcal));
  const ordered = days.slice().reverse();
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 4,
          height: 120,
        }}
      >
        {ordered.map((d, i) => {
          const h = (d.kcal / maxK) * 100;
          const todayish = i === ordered.length - 1;
          return (
            <div
              key={d.date || i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${Math.max(2, h)}%`,
                  background: todayish
                    ? DARK.yellow
                    : "rgba(255,255,255,0.15)",
                  borderTop: todayish ? `1px solid ${DARK.yellow}` : "none",
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: DARK.fg3,
          letterSpacing: "0.12em",
        }}
      >
        <span>30d AGO</span>
        <span>21d</span>
        <span>14d</span>
        <span>7d</span>
        <span>TODAY</span>
      </div>
    </div>
  );
}
