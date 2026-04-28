import * as React from "react";
import { fmtTime } from "@/lib/time";
import { CC } from "@/components/ui";
import type { Meal } from "@/types/meals";

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

export function HeroSentence({ meals }: { meals: Meal[] }) {
  if (meals.length === 0) {
    return (
      <>
        Standing by, <em style={{ color: CC.fg2 }}>no events today.</em>
      </>
    );
  }
  const first = meals[0]?.timestamp ? fmtTime(meals[0].timestamp) : "--:--";
  const last = meals[meals.length - 1]?.timestamp
    ? fmtTime(meals[meals.length - 1].timestamp)
    : "--:--";
  return (
    <>
      {spell(meals.length)} plate{meals.length === 1 ? "" : "s"}, {first}{" "}
      <em style={{ color: CC.fg2 }}>to {last}.</em>
    </>
  );
}
