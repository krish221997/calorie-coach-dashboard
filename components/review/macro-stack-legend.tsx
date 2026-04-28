import * as React from "react";
import { CC } from "@/components/ui";

export function MacroStackLegend() {
  return (
    <span style={{ display: "inline-flex", gap: 14, alignItems: "center" }}>
      <Swatch color={CC.yellow} label="protein" />
      <Swatch color={CC.blue} label="fat" />
      <Swatch color={CC.green} label="carbs" />
    </span>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        color: CC.fg2,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          background: color,
          borderRadius: 1,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}
