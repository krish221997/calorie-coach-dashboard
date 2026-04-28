import * as React from "react";
import { CC, Panel, Telemetry } from "@/components/ui";
import type { Meal } from "@/types/meals";

export function PayloadPanel({ meal }: { meal: Meal }) {
  return (
    <Panel
      id="01"
      title="PAYLOAD · KCAL"
      right={`ID · ${meal.id.slice(-6).toUpperCase()}`}
    >
      <Telemetry value={meal.kcal} unit="kcal" size={148} />
      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 14,
        }}
      >
        <Mini label="PROTEIN" v={meal.proteinG} unit="g" color={CC.yellow} />
        <Mini label="FAT" v={meal.fatG} unit="g" color={CC.blue} />
        <Mini label="CARBS" v={meal.carbsG} unit="g" color={CC.green} />
      </div>
    </Panel>
  );
}

function Mini({
  label,
  v,
  unit,
  color,
}: {
  label: string;
  v: number;
  unit: string;
  color?: string;
}) {
  return (
    <div style={{ borderTop: `1px solid ${CC.border}`, paddingTop: 10 }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: CC.fg3,
          letterSpacing: "0.18em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 24,
          color: color ?? CC.fg,
          marginTop: 4,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {v}
        <span style={{ fontSize: 11, color: CC.fg2, marginLeft: 4 }}>
          {unit}
        </span>
      </div>
    </div>
  );
}
