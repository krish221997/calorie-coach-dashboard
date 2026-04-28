import * as React from "react";
import { CC } from "@/components/ui";
import type { Meal } from "@/types/meals";

interface Row {
  label: string;
  v: number;
  color: string;
}

function countInputs(meals: Meal[]): { text: number; photo: number; voice: number } {
  const counts = { text: 0, photo: 0, voice: 0 };
  for (const m of meals) {
    if (m.inputType === "text") counts.text++;
    else if (m.inputType === "photo") counts.photo++;
    else if (m.inputType === "voice") counts.voice++;
  }
  return counts;
}

export function ChannelStack({ meals }: { meals: Meal[] }) {
  const counts = countInputs(meals);
  const max = Math.max(meals.length, 5);
  const rows: Row[] = [
    { label: "Text", v: counts.text, color: CC.fg },
    { label: "Photo", v: counts.photo, color: CC.yellow },
    { label: "Voice", v: counts.voice, color: CC.blue },
  ];
  return (
    <div>
      {rows.map((r) => (
        <ChannelRow key={r.label} row={r} max={max} />
      ))}
    </div>
  );
}

function ChannelRow({ row, max }: { row: Row; max: number }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          color: CC.fg2,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        <span>{row.label}</span>
        <span>
          {row.v} / {max}
        </span>
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 14,
              background: i < row.v ? row.color : CC.border,
              borderRadius: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
