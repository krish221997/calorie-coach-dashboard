"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { fmtTime } from "@/lib/time";
import { CC } from "@/components/ui";
import type { Meal } from "@/types/meals";

const KIND: Record<string, string> = {
  text: "TXT",
  photo: "IMG",
  voice: "VOX",
  unknown: "—",
};

export function EventLog({ meals }: { meals: Meal[] }) {
  const router = useRouter();
  if (meals.length === 0) return <EmptyEvents />;

  return (
    <div>
      {meals.map((m, i) => (
        <EventRow
          key={m.id}
          meal={m}
          isLast={i === meals.length - 1}
          onOpen={() => router.push(`/meal/${encodeURIComponent(m.id)}`)}
        />
      ))}
    </div>
  );
}

function EventRow({
  meal,
  isLast,
  onOpen,
}: {
  meal: Meal;
  isLast: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        width: "100%",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        display: "grid",
        gridTemplateColumns: "82px 52px 1fr 110px 80px",
        gap: 8,
        alignItems: "center",
        padding: "14px 0",
        borderBottom: isLast ? "none" : `1px solid ${CC.border}`,
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: CC.fg,
        transition: "background .15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = CC.card;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ color: CC.fg2, letterSpacing: "0.08em" }}>
        T+{fmtTime(meal.timestamp)}
      </span>
      <span style={{ color: CC.fg3, fontSize: 9, letterSpacing: "0.15em" }}>
        [{KIND[meal.inputType] ?? "—"}]
      </span>
      <span
        style={{ color: CC.fg, fontFamily: "var(--font-sans)", fontSize: 14 }}
      >
        {meal.items || meal.title || "—"}
      </span>
      <span
        style={{
          color: CC.fg2,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: 10,
        }}
      >
        {meal.mealType}
      </span>
      <span style={{ color: CC.yellow, textAlign: "right" }}>+{meal.kcal}</span>
    </button>
  );
}

function EmptyEvents() {
  return (
    <div
      style={{
        padding: "36px 0",
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: CC.fg3,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}
    >
      — no entries —
    </div>
  );
}
