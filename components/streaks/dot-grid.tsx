import * as React from "react";
import { CC } from "@/components/ui";
import type { DayTotals } from "@/types/meals";

export function DotGrid({
  days,
  target,
}: {
  days: DayTotals[];
  target: number;
}) {
  const list = days.slice().reverse();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(30, 1fr)",
        gap: 6,
      }}
    >
      {list.map((d) => (
        <DotCell key={d.date} day={d} target={target} />
      ))}
    </div>
  );
}

function DotCell({ day, target }: { day: DayTotals; target: number }) {
  const pct = target > 0 ? Math.min(1, day.kcal / target) : 0;
  const filled = day.mealCount > 0;
  return (
    <div
      title={`${day.date} · ${day.kcal} kcal`}
      style={{
        aspectRatio: "1",
        position: "relative",
        border: `1px solid ${filled ? "rgba(243,199,71,0.4)" : CC.border}`,
        background: filled
          ? `rgba(243,199,71,${(pct * 0.4).toFixed(3)})`
          : "transparent",
        borderRadius: 2,
        display: "grid",
        placeItems: "center",
      }}
    >
      {!filled && (
        <div
          style={{
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: CC.fg3,
          }}
        />
      )}
    </div>
  );
}
