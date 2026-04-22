import * as React from "react";
import { DARK } from "./tokens";
import { CKicker } from "./primitives";

/**
 * Oversize DM Serif Display hero — the "Five plates, a quarter past eight"
 * headline. Builds a sentence from real data so it feels live:
 *   "<count> plates, <a time>."
 */
export function MissionHero({
  mealCount,
  lastMealTime,
}: {
  mealCount: number;
  lastMealTime: string | null;
}) {
  const plates =
    mealCount === 0
      ? "Standing by"
      : `${spell(mealCount)} plate${mealCount === 1 ? "" : "s"}`;
  const tail =
    mealCount === 0
      ? "no events today."
      : lastMealTime
        ? `last at ${lastMealTime}.`
        : "logged on station.";

  return (
    <div style={{ padding: "32px 32px 0" }}>
      <CKicker>MISSION · T+TODAY · STATION 01</CKicker>
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 88,
          lineHeight: 0.92,
          letterSpacing: "-0.025em",
          marginTop: 16,
          marginBottom: 0,
          color: DARK.fg,
          maxWidth: 1000,
          fontWeight: 400,
        }}
      >
        {plates},{" "}
        <em style={{ color: DARK.fg2, fontStyle: "italic" }}>{tail}</em>
      </h1>
    </div>
  );
}

const NAMES = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
];
function spell(n: number): string {
  if (n >= 0 && n < NAMES.length) return NAMES[n];
  return String(n);
}
