import * as React from "react";
import { CC } from "@/components/ui";
import type { DayTotals } from "@/types/meals";

export function Narrative({
  thisWeek,
  lastWeek,
}: {
  thisWeek: DayTotals[];
  lastWeek: DayTotals[];
}) {
  if (thisWeek.length === 0) return <>No data this week yet.</>;

  const a = thisWeek.reduce((s, d) => s + d.kcal, 0) / thisWeek.length;
  const b = lastWeek.length
    ? lastWeek.reduce((s, d) => s + d.kcal, 0) / lastWeek.length
    : a;
  const pa = thisWeek.reduce((s, d) => s + d.proteinG, 0) / thisWeek.length;
  const pb = lastWeek.length
    ? lastWeek.reduce((s, d) => s + d.proteinG, 0) / lastWeek.length
    : pa;

  return (
    <>
      You averaged{" "}
      <span style={{ color: CC.yellow }}>{Math.round(a)} kcal</span> this week,{" "}
      <span style={{ color: a > b ? CC.green : CC.red }}>
        {a > b ? "up" : "down"} {Math.abs(Math.round(a - b))}
      </span>{" "}
      from last. Protein held at{" "}
      <span style={{ color: CC.yellow }}>{Math.round(pa)}g</span> —{" "}
      <em style={{ color: CC.fg2 }}>
        {pa > pb ? "better than" : "shy of"} last week&apos;s {Math.round(pb)}g.
      </em>
    </>
  );
}
