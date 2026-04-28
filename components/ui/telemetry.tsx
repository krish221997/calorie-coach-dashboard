"use client";

import * as React from "react";
import { CC } from "./tokens";

export function Telemetry({
  value,
  unit,
  size = 80,
  mono = false,
  color,
  jitter = false,
}: {
  value: number;
  unit?: string;
  size?: number;
  mono?: boolean;
  color?: string;
  jitter?: boolean;
}) {
  const [v, setV] = React.useState<number>(value || 0);

  React.useEffect(() => {
    if (!value) {
      setV(0);
      return;
    }
    let start: number | null = null;
    let raf = 0;
    let cancelled = false;
    const dur = 900;
    setV(0);
    const tick = (ts: number) => {
      if (cancelled) return;
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setV(value);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [value]);

  React.useEffect(() => {
    if (!jitter) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let inner: ReturnType<typeof setTimeout> | null = null;
    const loop = () => {
      const delay = 3000 + Math.random() * 5000;
      timer = setTimeout(() => {
        setV((prev) => prev + (Math.random() < 0.5 ? -1 : 1));
        inner = setTimeout(() => setV(value), 180);
        loop();
      }, delay);
    };
    loop();
    return () => {
      if (timer) clearTimeout(timer);
      if (inner) clearTimeout(inner);
    };
  }, [jitter, value]);

  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
      <span
        style={{
          fontFamily: mono ? "var(--font-mono)" : "var(--font-serif)",
          fontWeight: mono ? 500 : 400,
          fontSize: size,
          lineHeight: 0.9,
          color: color ?? CC.fg,
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
            color: CC.fg2,
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
