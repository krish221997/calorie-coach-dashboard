import * as React from "react";
import { DARK } from "./tokens";
import type { Meal } from "@/lib/meals";

/**
 * Mission-control flavored list of every meal logged today.
 * Each row: T+time · channel tag · items · meal type · +kcal.
 */
export function EventLog({ meals }: { meals: Meal[] }) {
  if (meals.length === 0) {
    return (
      <div
        style={{
          padding: "40px 0",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: DARK.fg3,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        — no entries —
      </div>
    );
  }

  return (
    <div>
      {meals.map((m, i) => {
        const t = m.timestamp
          ? new Date(m.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "--:--";
        const tag =
          m.inputType === "text"
            ? "TXT"
            : m.inputType === "photo"
              ? "IMG"
              : m.inputType === "voice"
                ? "VOX"
                : "LOG";
        const label = m.items || m.rawInput || m.title || "meal";
        return (
          <div
            key={m.id}
            style={{
              display: "grid",
              gridTemplateColumns: "80px 60px 1fr 120px 80px",
              alignItems: "center",
              padding: "14px 0",
              borderBottom:
                i === meals.length - 1
                  ? "none"
                  : `1px solid ${DARK.cardBorder}`,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          >
            <span style={{ color: DARK.fg2, letterSpacing: "0.1em" }}>
              T+{t}
            </span>
            <span
              style={{
                color: DARK.fg3,
                textTransform: "uppercase",
                fontSize: 9,
                letterSpacing: "0.15em",
              }}
            >
              [{tag}]
            </span>
            <span
              style={{
                color: DARK.fg,
                fontFamily: "var(--font-sans)",
                fontSize: 14,
              }}
            >
              {label}
            </span>
            <span
              style={{
                color: DARK.fg2,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontSize: 10,
              }}
            >
              {m.mealType}
            </span>
            <span
              style={{
                color: DARK.yellow,
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              +{Math.round(m.kcal)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
