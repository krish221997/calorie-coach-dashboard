"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { fmtDate, fmtTime } from "@/lib/time";
import { CC } from "@/components/ui";
import type { Meal } from "@/types/meals";

function formatContent(meal: Meal): string {
  if (meal.inputType === "voice") return `"${meal.transcript || meal.items}"`;
  if (meal.inputType === "photo")
    return `[image attachment · ${meal.items}]`;
  return meal.items || meal.title;
}

export function LogRow({ meal }: { meal: Meal }) {
  const router = useRouter();
  const stamp = `${fmtDate(meal.timestamp)} · ${fmtTime(meal.timestamp)}`;
  const content = formatContent(meal);

  return (
    <div style={{ padding: "16px 0", borderBottom: `1px solid ${CC.border}` }}>
      <RowHeader stamp={stamp} badge={meal.inputType.toUpperCase()} />
      <UserLine content={content} inputType={meal.inputType} />
      <CoachLine
        meal={meal}
        onOpen={() => router.push(`/meal/${encodeURIComponent(meal.id)}`)}
      />
    </div>
  );
}

function RowHeader({ stamp, badge }: { stamp: string; badge: string }) {
  return (
    <div
      style={{ display: "flex", gap: 12, alignItems: "baseline", marginBottom: 6 }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: CC.fg3,
          letterSpacing: "0.15em",
        }}
      >
        {stamp}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: CC.yellow,
          letterSpacing: "0.18em",
        }}
      >
        [{badge}]
      </span>
    </div>
  );
}

function UserLine({
  content,
  inputType,
}: {
  content: string;
  inputType: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr",
        gap: 14,
        marginBottom: 10,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: CC.blue,
          letterSpacing: "0.15em",
        }}
      >
        YOU &gt;
      </span>
      <span
        style={{
          fontFamily:
            inputType === "voice" ? "var(--font-serif)" : "var(--font-sans)",
          fontStyle: inputType === "voice" ? "italic" : "normal",
          fontSize: 14,
          color: CC.fg,
          lineHeight: 1.55,
        }}
      >
        {content}
      </span>
    </div>
  );
}

function CoachLine({ meal, onOpen }: { meal: Meal; onOpen: () => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 14 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: CC.yellow,
          letterSpacing: "0.15em",
        }}
      >
        CC &gt;
      </span>
      <div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: CC.fg2,
            lineHeight: 1.6,
          }}
        >
          Logged ✓ <span style={{ color: CC.fg }}>{meal.items || meal.title}</span>
          . ~<span style={{ color: CC.yellow }}>{meal.kcal} kcal</span>,{" "}
          <span style={{ color: CC.yellow }}>{meal.proteinG}g</span> protein,{" "}
          <span style={{ color: CC.yellow }}>{meal.fatG}g</span> fat,{" "}
          <span style={{ color: CC.yellow }}>{meal.carbsG}g</span> carbs.{" "}
          <button
            type="button"
            onClick={onOpen}
            style={{
              background: "none",
              border: "none",
              color: CC.blue,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            open payload →
          </button>
        </span>
      </div>
    </div>
  );
}
