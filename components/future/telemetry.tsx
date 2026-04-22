"use client";

import * as React from "react";
import { DARK } from "./tokens";

/**
 * Count-up digit used for every big readout (kcal, macros, streak count).
 * Ease-out cubic over 900ms — identical to the original Direction C source.
 */
export function Telemetry({
  value,
  unit,
  size = 80,
  mono = false,
}: {
  value: number;
  unit?: string;
  size?: number;
  mono?: boolean;
}) {
  const [v, setV] = React.useState(0);

  React.useEffect(() => {
    let start: number | null = null;
    let raf = 0;
    const dur = 900;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      setV(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
      <span
        style={{
          fontFamily: mono ? "var(--font-mono)" : "var(--font-serif)",
          fontWeight: mono ? 500 : 400,
          fontSize: size,
          lineHeight: 0.9,
          color: DARK.fg,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: mono ? "-0.02em" : "-0.025em",
        }}
      >
        {v.toLocaleString()}
      </span>
      {unit ? (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: DARK.fg2,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {unit}
        </span>
      ) : null}
    </span>
  );
}
