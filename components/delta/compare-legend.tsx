import * as React from "react";
import { CC } from "@/components/ui";

export function CompareLegend() {
  return (
    <span
      style={{
        display: "inline-flex",
        gap: 14,
        alignItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        color: CC.fg2,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span
          aria-hidden
          style={{ width: 14, height: 2, background: CC.yellow }}
        />
        this week
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span
          aria-hidden
          style={{
            width: 14,
            height: 0,
            borderTop: `2px dashed ${CC.fg3}`,
          }}
        />
        last week
      </span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: CC.fg3,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 14,
            height: 0,
            borderTop: `1px dashed ${CC.yellow}`,
            opacity: 0.7,
          }}
        />
        target
      </span>
    </span>
  );
}
