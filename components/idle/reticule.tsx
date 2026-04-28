"use client";

import * as React from "react";
import { useNow } from "@/hooks/ui/use-now";
import { fmtClock } from "@/lib/time";
import { CC, LED } from "@/components/ui";
import type { StatusColor } from "@/types/ui";

const RINGS = [250, 220, 190, 160];

export function Reticule({
  kcal = 0,
  statusLabel = "AWAITING",
  statusColor = "yellow",
}: {
  kcal?: number;
  statusLabel?: string;
  statusColor?: StatusColor;
}) {
  const now = useNow(1000);
  return (
    <div style={{ display: "grid", placeItems: "center", padding: "40px 0" }}>
      <div style={{ position: "relative", width: 520, height: 520 }}>
        <ReticuleSVG />
        <CenterReadout
          now={now}
          kcal={kcal}
          statusLabel={statusLabel}
          statusColor={statusColor}
        />
      </div>
    </div>
  );
}

function ReticuleSVG() {
  return (
    <svg
      viewBox="0 0 520 520"
      width="520"
      height="520"
      style={{ position: "absolute", inset: 0 }}
    >
      {RINGS.map((r, i) => (
        <circle
          key={i}
          cx="260"
          cy="260"
          r={r}
          fill="none"
          stroke={CC.border}
          strokeWidth="1"
          strokeDasharray={i % 2 ? "3 4" : undefined}
        />
      ))}
      <line x1="0" y1="260" x2="520" y2="260" stroke={CC.border} />
      <line x1="260" y1="0" x2="260" y2="520" stroke={CC.border} />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={260 + Math.cos(a) * 250}
            y1={260 + Math.sin(a) * 250}
            x2={260 + Math.cos(a) * 240}
            y2={260 + Math.sin(a) * 240}
            stroke={CC.borderStrong}
          />
        );
      })}
      <g
        style={{
          transformOrigin: "260px 260px",
          animation: "ccReticule 60s linear infinite",
        }}
      >
        <circle
          cx="260"
          cy="260"
          r="120"
          fill="none"
          stroke={CC.yellow}
          strokeOpacity="0.4"
          strokeDasharray="4 8"
        />
        <circle cx="260" cy="140" r="4" fill={CC.yellow} />
      </g>
    </svg>
  );
}

function CenterReadout({
  now,
  kcal,
  statusLabel,
  statusColor,
}: {
  now: Date;
  kcal: number;
  statusLabel: string;
  statusColor: StatusColor;
}) {
  // Format with always-visible thousands separator.
  // For 0 we keep the original "0,000" cinematic look.
  const display =
    kcal > 0
      ? kcal.toLocaleString()
      : (
          <>
            0<span style={{ color: CC.fg3 }}>,</span>000
          </>
        );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <div>
        <LED color={statusColor} label={statusLabel} />
        <div
          style={{
            marginTop: 14,
            fontFamily: "var(--font-serif)",
            fontSize: 72,
            lineHeight: 0.9,
            color: CC.fg,
          }}
        >
          {display}
        </div>
        <div
          style={{
            marginTop: 4,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: CC.fg2,
            letterSpacing: "0.2em",
          }}
        >
          KCAL · T+{fmtClock(now)}
        </div>
      </div>
    </div>
  );
}
