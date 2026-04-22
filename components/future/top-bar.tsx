"use client";

import * as React from "react";
import { DARK } from "./tokens";
import { CKicker } from "./primitives";

/**
 * Telemetry strip across the top. Live clock ticks each second so there's
 * always motion; the other fields are steady reflections of connection state.
 */
export function TopBar({
  connections,
  lastIngest,
  uptime = "14d 02h",
}: {
  connections: { notion: boolean; one: boolean };
  lastIngest?: string;
  uptime?: string;
}) {
  const [clock, setClock] = React.useState(() => formatClock(new Date()));
  React.useEffect(() => {
    const id = window.setInterval(
      () => setClock(formatClock(new Date())),
      1000
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 32px",
        borderBottom: `1px solid ${DARK.cardBorder}`,
        background: "rgba(14,14,13,0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: DARK.yellow,
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 600,
            color: "#0E0E0D",
          }}
        >
          cc
        </div>
        <CKicker>CC / STATION 01 / ACTIVE</CKicker>
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: DARK.green,
            animation: "ccBlink 2s infinite",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: 28,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: DARK.fg2,
          letterSpacing: "0.1em",
        }}
      >
        <span>UPTIME · {uptime}</span>
        <span>
          LINK · NOTION{" "}
          <span style={{ color: connections.notion ? DARK.green : DARK.red }}>
            {connections.notion ? "✓" : "×"}
          </span>
        </span>
        <span>
          LINK · ONE{" "}
          <span style={{ color: connections.one ? DARK.green : DARK.red }}>
            {connections.one ? "✓" : "×"}
          </span>
        </span>
        {lastIngest ? (
          <span>LAST INGEST · T+{lastIngest}</span>
        ) : null}
        <span style={{ color: DARK.fg }}>T+ {clock}</span>
      </div>
    </div>
  );
}

function formatClock(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
