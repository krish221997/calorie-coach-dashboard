import * as React from "react";
import { CC, Panel } from "@/components/ui";
import type { Meal } from "@/types/meals";

export function TranscriptPanel({
  meal,
  timeLabel,
  panelId,
}: {
  meal: Meal;
  timeLabel: string;
  partsLength: number;
  panelId: string;
}) {
  return (
    <Panel id={panelId} title="AGENT LOG · VERBATIM">
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          lineHeight: 1.8,
          color: CC.fg2,
        }}
      >
        <span style={{ color: CC.green }}>[T+{timeLabel}]</span> ingest via{" "}
        {meal.inputType}.
        <br />
        <span style={{ color: CC.yellow }}>[T+{timeLabel}]</span> Logged ✓{" "}
        {meal.items || meal.title}.
        <br />
        <span style={{ color: CC.fg3 }}>
          ~{meal.kcal} kcal · {meal.proteinG}g protein · {meal.fatG}g fat ·{" "}
          {meal.carbsG}g carbs
        </span>
        {meal.rawInput && meal.inputType !== "voice" ? (
          <>
            <br />
            <br />
            <span style={{ color: CC.fg3 }}>— USER MESSAGE —</span>
            <br />
            <span
              style={{
                fontFamily: "var(--font-sans)",
                color: CC.fg,
                fontSize: 13,
              }}
            >
              {meal.rawInput}
            </span>
          </>
        ) : null}
        {meal.transcript ? (
          <>
            <br />
            <br />
            <span style={{ color: CC.fg3 }}>— VOICE TRANSCRIPT —</span>
            <br />
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                color: CC.fg,
                fontSize: 14,
              }}
            >
              &ldquo;{meal.transcript}&rdquo;
            </span>
          </>
        ) : null}
      </div>
    </Panel>
  );
}
