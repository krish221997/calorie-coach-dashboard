import * as React from "react";
import { DARK } from "./tokens";

/**
 * Left-edge mission-control nav: 01 TODAY / 02 REVIEW / 03 STREAKS /
 * 04 DELTA / 05 LOG / 06 IDLE. Non-interactive for v1 (this dashboard
 * is a single page) but keeps the Direction C silhouette intact.
 */
const STATIONS = [
  { code: "01", label: "TODAY", active: true },
  { code: "02", label: "REVIEW" },
  { code: "03", label: "STREAKS" },
  { code: "04", label: "DELTA" },
  { code: "05", label: "LOG" },
  { code: "06", label: "IDLE" },
];

export function StationNav() {
  return (
    <nav
      aria-label="Station"
      style={{
        width: 140,
        flexShrink: 0,
        padding: "24px 0 24px 20px",
        borderRight: `1px solid ${DARK.cardBorder}`,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {STATIONS.map((s) => {
        const active = !!s.active;
        return (
          <div
            key={s.code}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.16em",
              color: active ? DARK.fg : DARK.fg3,
              background: active ? "rgba(243,199,71,0.05)" : "transparent",
              borderLeft: active
                ? `2px solid ${DARK.yellow}`
                : "2px solid transparent",
            }}
          >
            <span
              style={{
                color: active ? DARK.yellow : DARK.fg3,
                fontWeight: 500,
              }}
            >
              {s.code}
            </span>
            <span>{s.label}</span>
          </div>
        );
      })}
    </nav>
  );
}
