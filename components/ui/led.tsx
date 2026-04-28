import * as React from "react";
import type { StatusColor } from "@/types/ui";
import { CC } from "./tokens";

function resolveColor(color: StatusColor | string): string {
  switch (color) {
    case "green":
      return CC.green;
    case "yellow":
      return CC.yellow;
    case "red":
      return CC.red;
    case "blue":
      return CC.blue;
    default:
      return color;
  }
}

export function LED({
  color = "green",
  size = 6,
  pulse = true,
  label,
}: {
  color?: StatusColor | string;
  size?: number;
  pulse?: boolean;
  label?: string;
}) {
  const c = resolveColor(color);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          position: "relative",
          display: "inline-block",
          width: size,
          height: size,
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: c,
            boxShadow: `0 0 8px ${c}`,
          }}
        />
        {pulse && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: c,
              animation: "ccPulseRing 2s ease-out infinite",
            }}
          />
        )}
      </span>
      {label && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: CC.fg2,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
