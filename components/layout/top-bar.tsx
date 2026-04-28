"use client";

import * as React from "react";
import { useNow } from "@/hooks/ui/use-now";
import { fmtClock } from "@/lib/time";
import { CC, Kicker, LED } from "@/components/ui";

export function TopBar({
  route = "TODAY",
  lastIngest,
}: {
  route?: string;
  lastIngest?: string;
}) {
  const now = useNow(1000);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 28px",
        borderBottom: `1px solid ${CC.border}`,
        background: `color-mix(in srgb, ${CC.bg} 93%, transparent)`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 9,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Kicker>CC / STATION 01 / {route}</Kicker>
        <span
          aria-hidden
          style={{ width: 1, height: 14, background: CC.border }}
        />
        <LED color="green" label="NOMINAL" />
      </div>
      <div
        style={{
          display: "flex",
          gap: 24,
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          color: CC.fg2,
          letterSpacing: "0.1em",
        }}
      >
        <span>LAST INGEST · {lastIngest ?? "T+--:--"}</span>
        <span style={{ color: CC.fg }}>T+{fmtClock(now)}</span>
      </div>
    </div>
  );
}
