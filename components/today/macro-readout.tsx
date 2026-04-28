import * as React from "react";
import { CC, Panel, Telemetry } from "@/components/ui";

export function MacroReadout({
  id,
  label,
  value,
  target,
  unit,
  color,
}: {
  id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}) {
  const p = Math.min(1, target > 0 ? value / target : 0);
  const remaining = target - value;
  const rightLabel =
    remaining > 0
      ? `Δ ${remaining}${unit} LEFT`
      : remaining === 0
        ? "ON TARGET"
        : `Δ +${Math.abs(remaining)}${unit} OVER`;
  return (
    <Panel id={id} title={label} right={rightLabel}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <Telemetry value={value} unit={unit} size={48} mono />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: CC.fg3,
            letterSpacing: "0.1em",
          }}
        >
          / {target}
          {unit}
        </span>
      </div>
      <div
        style={{
          marginTop: 12,
          height: 3,
          background: CC.border,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${p * 100}%`,
            background: color,
            transition: "width .8s ease-out",
          }}
        />
      </div>
    </Panel>
  );
}
