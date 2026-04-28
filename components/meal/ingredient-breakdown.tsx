import * as React from "react";
import { pad } from "@/lib/time";
import { CC, Panel } from "@/components/ui";
import type { Meal } from "@/types/meals";

export function IngredientBreakdown({
  meal,
  parts,
}: {
  meal: Meal;
  parts: string[];
}) {
  const each = parts.length > 0 ? Math.round(meal.kcal / parts.length) : meal.kcal;

  return (
    <Panel
      id="03"
      title="INGREDIENT BREAKDOWN · ESTIMATED SPLIT"
      right="EVEN SPLIT FROM TOTAL"
    >
      {parts.length === 0 ? (
        <div
          style={{
            color: CC.fg2,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
          }}
        >
          No items recognised.
        </div>
      ) : (
        parts.map((name, i) => (
          <IngredientRow
            key={i}
            index={i}
            isLast={i === parts.length - 1}
            name={name}
            kcal={each}
            protein={Math.round(meal.proteinG / Math.max(1, parts.length))}
            fat={Math.round(meal.fatG / Math.max(1, parts.length))}
            carbs={Math.round(meal.carbsG / Math.max(1, parts.length))}
          />
        ))
      )}
    </Panel>
  );
}

function IngredientRow({
  index,
  isLast,
  name,
  kcal,
  protein,
  fat,
  carbs,
}: {
  index: number;
  isLast: boolean;
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "36px 2fr 1fr 1fr 1fr 1fr",
        padding: "12px 0",
        borderBottom: isLast ? "none" : `1px solid ${CC.border}`,
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        alignItems: "center",
      }}
    >
      <span style={{ color: CC.fg3 }}>{pad(index + 1)}</span>
      <span
        style={{
          color: CC.fg,
          fontFamily: "var(--font-sans)",
          fontSize: 13.5,
        }}
      >
        {name}
      </span>
      <span style={{ color: CC.yellow, textAlign: "right" }}>{kcal} kcal</span>
      <span style={{ color: CC.fg2, textAlign: "right" }}>{protein}p</span>
      <span style={{ color: CC.fg2, textAlign: "right" }}>{fat}f</span>
      <span style={{ color: CC.fg2, textAlign: "right" }}>{carbs}c</span>
    </div>
  );
}
