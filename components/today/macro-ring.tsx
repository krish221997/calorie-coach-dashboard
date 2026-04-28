"use client";

import * as React from "react";
import { CC } from "@/components/ui";

export function MacroRing({ pct }: { pct: number }) {
  const r = 66;
  const c = 2 * Math.PI * r;
  const [drawn, setDrawn] = React.useState(0);

  React.useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    const loop = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / 1100);
      setDrawn(pct * p);
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  return (
    <svg width="170" height="170" viewBox="0 0 170 170">
      <g stroke={CC.border} strokeWidth="1">
        <circle cx="85" cy="85" r="82" fill="none" />
        <circle cx="85" cy="85" r={r} fill="none" />
        <line x1="0" y1="85" x2="8" y2="85" />
        <line x1="162" y1="85" x2="170" y2="85" />
        <line x1="85" y1="0" x2="85" y2="8" />
        <line x1="85" y1="162" x2="85" y2="170" />
      </g>
      <circle
        cx="85"
        cy="85"
        r={r}
        fill="none"
        stroke={CC.yellow}
        strokeWidth="2"
        strokeDasharray={`${c * Math.min(1, drawn)} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 85 85)"
      />
      <text
        x="85"
        y="82"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fill={CC.fg3}
        letterSpacing="2"
      >
        DAY
      </text>
      <text
        x="85"
        y="102"
        textAnchor="middle"
        fontFamily="var(--font-serif)"
        fontSize="32"
        fill={CC.fg}
      >
        {Math.round(drawn * 100)}%
      </text>
    </svg>
  );
}
