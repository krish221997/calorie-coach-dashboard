"use client";

import * as React from "react";
import { useNow } from "@/hooks/ui/use-now";
import { fmtClock } from "@/lib/time";
import { CC } from "@/components/ui";

export function MissionClock({ streak }: { streak: number }) {
  const now = useNow(1000);
  const max = Math.max(streak, 14);
  const angle = (streak / max) * 360;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
      <ClockFace streak={streak} angle={angle} seconds={now.getSeconds()} />
      <ClockSidebar now={now} />
    </div>
  );
}

function ClockFace({
  streak,
  angle,
  seconds,
}: {
  streak: number;
  angle: number;
  seconds: number;
}) {
  return (
    <svg viewBox="0 0 340 340" width="340" height="340">
      <circle cx="170" cy="170" r="160" fill="none" stroke={CC.border} />
      <circle
        cx="170"
        cy="170"
        r="130"
        fill="none"
        stroke={CC.border}
        strokeDasharray="2 4"
      />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
        const x1 = 170 + Math.cos(a) * 160;
        const y1 = 170 + Math.sin(a) * 160;
        const x2 = 170 + Math.cos(a) * (i % 6 === 0 ? 145 : 152);
        const y2 = 170 + Math.sin(a) * (i % 6 === 0 ? 145 : 152);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={i % 6 === 0 ? CC.borderStrong : CC.border}
            strokeWidth={i % 6 === 0 ? 1.5 : 1}
          />
        );
      })}
      <circle
        cx="170"
        cy="170"
        r="145"
        fill="none"
        stroke={CC.yellow}
        strokeWidth="6"
        strokeDasharray={`${(angle / 360) * 2 * Math.PI * 145} ${
          2 * Math.PI * 145
        }`}
        transform="rotate(-90 170 170)"
        strokeLinecap="butt"
      />
      <g transform={`rotate(${seconds * 6 - 90} 170 170)`}>
        <line
          x1="170"
          y1="170"
          x2="170"
          y2="50"
          stroke={CC.red}
          strokeWidth="1"
          opacity="0.7"
        />
        <circle cx="170" cy="50" r="3" fill={CC.red} />
      </g>
      <circle cx="170" cy="170" r="4" fill={CC.fg} />
      <text
        x="170"
        y="190"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fill={CC.fg3}
        letterSpacing="2"
      >
        STREAK
      </text>
      <text
        x="170"
        y="232"
        textAnchor="middle"
        fontFamily="var(--font-serif)"
        fontSize="68"
        fill={CC.fg}
      >
        {streak}
      </text>
      <text
        x="170"
        y="252"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fill={CC.fg3}
        letterSpacing="2"
      >
        DAYS
      </text>
    </svg>
  );
}

function ClockSidebar({ now }: { now: Date }) {
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 22,
          color: CC.fg2,
          lineHeight: 1.5,
          maxWidth: 420,
        }}
      >
        &ldquo;The hand sweeps regardless. Showing up, even once a day, is the
        whole thing.&rdquo;
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: CC.fg3,
          letterSpacing: "0.2em",
        }}
      >
        — COACH&rsquo;S NOTE · T+{fmtClock(now)}
      </div>
    </div>
  );
}
