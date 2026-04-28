import * as React from "react";
import { CC, Panel, Telemetry } from "@/components/ui";

type Tone = "good" | "warn" | "ok";

function toneColor(tone?: Tone): string {
  return tone === "good" ? CC.green : tone === "warn" ? CC.red : CC.fg;
}

export function BigStat({
  id,
  label,
  value,
  unit,
  tone,
}: {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  tone?: Tone;
}) {
  const color = toneColor(tone);
  const isString = typeof value === "string";

  return (
    <Panel id={id} title={label}>
      {isString ? (
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 48,
            lineHeight: 1,
            color,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
      ) : (
        <Telemetry
          value={value as number}
          unit={unit}
          size={44}
          mono
          color={color}
        />
      )}
    </Panel>
  );
}
