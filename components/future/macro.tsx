import * as React from "react";
import { DARK } from "./tokens";
import { CKicker, Panel } from "./primitives";
import { Telemetry } from "./telemetry";

/**
 * Big circular progress ring for the PRIMARY kcal card.
 */
export function MacroRing({ pct }: { pct: number }) {
  const r = 72;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, pct));
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="2"
      />
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke={DARK.yellow}
        strokeWidth="2"
        strokeDasharray={`${c * clamped} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 90 90)"
      />
      <text
        x="90"
        y="88"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="10"
        fill={DARK.fg2}
        letterSpacing="2"
      >
        DAY
      </text>
      <text
        x="90"
        y="108"
        textAnchor="middle"
        fontFamily="var(--font-serif)"
        fontSize="36"
        fill={DARK.fg}
      >
        {Math.round(clamped * 100)}%
      </text>
    </svg>
  );
}

/**
 * One of the three secondary stat cards (PROTEIN / FAT / CARBS).
 * Fill color is caller-chosen: yellow/blue/green per Direction C spec.
 */
export function MacroReadout({
  label,
  value,
  target,
  unit,
  color,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}) {
  const p = target > 0 ? Math.min(1, value / target) : 0;
  const remaining = Math.max(0, target - value);
  return (
    <Panel
      title={label.toUpperCase()}
      right={`Δ ${remaining}${unit} LEFT`}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <Telemetry value={value} unit={unit} size={56} mono />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: DARK.fg3,
            letterSpacing: "0.1em",
          }}
        >
          / {target}
          {unit}
        </span>
      </div>
      <div
        style={{
          marginTop: 14,
          height: 3,
          background: "rgba(255,255,255,0.06)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${p * 100}%`,
            background: color,
          }}
        />
      </div>
    </Panel>
  );
}

/**
 * Small label/value cell used in the detail panel's classification grid.
 */
export function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <CKicker>{label}</CKicker>
      <div
        style={{
          marginTop: 4,
          fontFamily: "var(--font-mono)",
          fontSize: 14,
          color: DARK.fg,
          letterSpacing: "0.05em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * Channel bar — blocky 5-segment meter used in the INPUT CHANNELS panel.
 */
export function ChannelBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const v = Math.min(max, Math.max(0, value));
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          color: DARK.fg2,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        <span>{label}</span>
        <span>
          {v} / {max}
        </span>
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 16,
              background: i < v ? color : "rgba(255,255,255,0.06)",
              borderRadius: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
