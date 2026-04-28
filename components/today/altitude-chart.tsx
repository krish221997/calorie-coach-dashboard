"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CC } from "@/components/ui";

export interface AltitudePoint {
  x: number; // 0-1 fraction across the day
  y: number; // cumulative kcal at this point
  id: string;
  items: string;
  kcal: number;
  timeLabel: string;
}

const W = 1000;
const H = 180;
const TOP_PAD = 20;

export function AltitudeChart({
  points,
  target,
}: {
  points: AltitudePoint[];
  target: number;
}) {
  const router = useRouter();
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const safeTarget = target > 0 ? target : 1;

  const project = (p: AltitudePoint) => ({
    cx: p.x * W,
    cy: H - (p.y / safeTarget) * (H - TOP_PAD),
  });

  const fillPath =
    points.length > 0
      ? `M 0 ${H} L ${points
          .map((p) => `${project(p).cx},${project(p).cy}`)
          .join(" L ")} L ${W} ${H}`
      : "";
  const linePath =
    points.length > 0
      ? `M ${points
          .map((p) => `${project(p).cx},${project(p).cy}`)
          .join(" L ")}`
      : "";

  return (
    <div
      style={{
        marginTop: 26,
        height: 210,
        position: "relative",
        borderTop: `1px solid ${CC.border}`,
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: H }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="alt-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={CC.yellow} stopOpacity="0.4" />
            <stop offset="100%" stopColor={CC.yellow} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1={TOP_PAD}
          x2={W}
          y2={TOP_PAD}
          stroke={CC.yellow}
          strokeOpacity="0.35"
          strokeDasharray="3 4"
        />
        {[0.25, 0.5, 0.75].map((x) => (
          <line
            key={x}
            x1={x * W}
            y1="0"
            x2={x * W}
            y2={H}
            stroke={CC.border}
          />
        ))}
        {points.length > 0 ? (
          <>
            <path d={fillPath} fill="url(#alt-grad)" />
            <path d={linePath} fill="none" stroke={CC.yellow} strokeWidth="1.5" />
            {points.map((p, i) => {
              const { cx, cy } = project(p);
              const isHover = hoverIdx === i;
              return (
                <g
                  key={i}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoverIdx(i)}
                  onClick={() =>
                    router.push(`/meal/${encodeURIComponent(p.id)}`)
                  }
                >
                  <circle cx={cx} cy={cy} r={isHover ? 6 : 4} fill={CC.yellow} />
                  <circle
                    cx={cx}
                    cy={cy}
                    r="11"
                    fill={CC.yellow}
                    fillOpacity={isHover ? 0.15 : 0}
                    stroke={CC.yellow}
                    strokeOpacity={isHover ? 0.5 : 0.3}
                  />
                </g>
              );
            })}
          </>
        ) : null}
      </svg>
      <AxisLabels />
      <Legend />
      {hoverIdx !== null && points[hoverIdx] ? (
        <Tooltip point={points[hoverIdx]} totalAtPoint={points[hoverIdx].y} />
      ) : null}
    </div>
  );
}

function AxisLabels() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 8,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        color: CC.fg3,
        letterSpacing: "0.12em",
      }}
    >
      <span>00:00</span>
      <span>06:00</span>
      <span>12:00</span>
      <span>18:00</span>
      <span>24:00</span>
    </div>
  );
}

function Legend() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: -8,
        right: 0,
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        color: CC.fg3,
        letterSpacing: "0.12em",
      }}
    >
      <span style={{ color: CC.yellow }}>●</span> cumulative ·{" "}
      <span style={{ color: CC.yellow, opacity: 0.5 }}>––</span> target
    </div>
  );
}

function Tooltip({
  point,
  totalAtPoint,
}: {
  point: AltitudePoint;
  totalAtPoint: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${point.x * 100}%`,
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
        minWidth: 220,
        maxWidth: 280,
        boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
        zIndex: 5,
      }}
    >
      <div style={{ color: CC.fg2, marginBottom: 4 }}>T+{point.timeLabel}</div>
      <div
        style={{
          color: CC.fg,
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          marginBottom: 6,
        }}
      >
        {point.items}
      </div>
      <div style={{ display: "flex", gap: 12, color: CC.fg2 }}>
        <span>
          this meal ·{" "}
          <span style={{ color: CC.yellow }}>+{point.kcal} kcal</span>
        </span>
        <span>
          cumulative ·{" "}
          <span style={{ color: CC.fg }}>{totalAtPoint.toLocaleString()}</span>
        </span>
      </div>
      <div
        style={{
          marginTop: 8,
          paddingTop: 6,
          borderTop: `1px solid ${CC.border}`,
          color: CC.fg3,
          fontSize: 10,
        }}
      >
        click for full payload →
      </div>
    </div>
  );
}
