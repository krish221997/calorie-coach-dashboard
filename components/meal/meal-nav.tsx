import * as React from "react";
import { CC, Kicker } from "@/components/ui";

export function MealNav({
  index,
  total,
  dateLabel,
  timeLabel,
  canPrev,
  canNext,
  onBack,
  onPrev,
  onNext,
}: {
  index: number;
  total: number;
  dateLabel: string;
  timeLabel: string;
  canPrev: boolean;
  canNext: boolean;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button type="button" onClick={onBack} style={navBtn(false)}>
          ← BACK
        </button>
        <Kicker>
          EVENT {index + 1} / {total} · {dateLabel} · T+{timeLabel}
        </Kicker>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          style={navBtn(!canPrev)}
        >
          ← PREV
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          style={navBtn(!canNext)}
        >
          NEXT →
        </button>
      </div>
    </div>
  );
}

function navBtn(disabled: boolean): React.CSSProperties {
  return {
    background: "none",
    border: `1px solid ${CC.border}`,
    color: disabled ? CC.fg3 : CC.fg,
    padding: "6px 12px",
    borderRadius: 3,
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    letterSpacing: "0.2em",
    cursor: disabled ? "not-allowed" : "pointer",
    textTransform: "uppercase",
    opacity: disabled ? 0.4 : 1,
  };
}
