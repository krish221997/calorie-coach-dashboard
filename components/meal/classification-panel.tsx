import * as React from "react";
import { CC, Panel } from "@/components/ui";
import type { Meal } from "@/types/meals";

export function ClassificationPanel({
  meal,
  timeLabel,
  partsLength,
  dayKcal,
}: {
  meal: Meal;
  timeLabel: string;
  partsLength: number;
  dayKcal: number;
}) {
  return (
    <Panel id="02" title="CLASSIFICATION">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          rowGap: 14,
          columnGap: 14,
        }}
      >
        <Meta label="TYPE" value={meal.mealType.toUpperCase()} />
        <Meta label="INPUT" value={meal.inputType.toUpperCase()} />
        <Meta label="ITEMS" value={String(partsLength || 1)} />
        <Meta label="LOGGED" value={`${timeLabel}Z`} />
        <Meta
          label="SHARE OF DAY"
          value={dayKcal > 0 ? `${Math.round((meal.kcal / dayKcal) * 100)}%` : "—"}
        />
        <Meta label="ID" value={meal.id.slice(-6).toUpperCase()} />
      </div>
    </Panel>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: CC.fg3,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 4,
          fontFamily: "var(--font-mono)",
          fontSize: 14,
          color: CC.fg,
          letterSpacing: "0.05em",
        }}
      >
        {value}
      </div>
    </div>
  );
}
