"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TZ, fmtTime } from "@/lib/time";
import { CC, Kicker } from "@/components/ui";
import type { Meal } from "@/types/meals";
import { ClassificationPanel } from "./classification-panel";
import { IngredientBreakdown } from "./ingredient-breakdown";
import { MealNav } from "./meal-nav";
import { PayloadPanel } from "./payload-panel";
import { PhotoPanel } from "./photo-panel";
import { TranscriptPanel } from "./transcript-panel";

export interface MealScreenProps {
  meal: Meal;
  allIds: string[];
  dayKcal: number;
}

function splitTitle(text: string): React.ReactNode {
  const parts = text.split(",");
  if (parts.length <= 1) return text;
  const head = parts[0];
  const tail = parts.slice(1).join(",").trim();
  return (
    <>
      {head}, <em style={{ color: CC.fg2 }}>{tail || "—"}.</em>
    </>
  );
}

function extractParts(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function MealScreen({ meal, allIds, dayKcal }: MealScreenProps) {
  const router = useRouter();
  const idx = allIds.indexOf(meal.id);

  const goBack = React.useCallback(() => router.push("/log"), [router]);
  const goPrev = React.useCallback(() => {
    if (idx < allIds.length - 1)
      router.push(`/meal/${encodeURIComponent(allIds[idx + 1])}`);
  }, [router, idx, allIds]);
  const goNext = React.useCallback(() => {
    if (idx > 0) router.push(`/meal/${encodeURIComponent(allIds[idx - 1])}`);
  }, [router, idx, allIds]);

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") goBack();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goBack, goNext, goPrev]);

  const time = fmtTime(meal.timestamp);
  const date = new Date(meal.timestamp).toLocaleDateString("en-GB", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const parts = extractParts(meal.items || meal.title || "");

  return (
    <div className="cc-screen" style={{ padding: "28px 32px" }}>
      <MealNav
        index={idx}
        total={allIds.length}
        dateLabel={date}
        timeLabel={time}
        canPrev={idx < allIds.length - 1}
        canNext={idx > 0}
        onBack={goBack}
        onPrev={goPrev}
        onNext={goNext}
      />

      <Kicker>
        PAYLOAD · {meal.mealType.toUpperCase()} · INPUT ·{" "}
        {meal.inputType.toUpperCase()}
      </Kicker>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 80,
          lineHeight: 0.9,
          letterSpacing: "-0.025em",
          marginTop: 14,
          color: CC.fg,
          maxWidth: 1100,
        }}
      >
        {splitTitle(meal.items || meal.title || "—")}
      </div>

      <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <PayloadPanel meal={meal} />
        <ClassificationPanel
          meal={meal}
          timeLabel={time}
          partsLength={parts.length}
          dayKcal={dayKcal}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <IngredientBreakdown meal={meal} parts={parts} />
      </div>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns:
            meal.inputType === "photo" && meal.photoUrl ? "1fr 1fr" : "1fr",
          gap: 20,
        }}
      >
        {meal.inputType === "photo" && meal.photoUrl ? (
          <PhotoPanel meal={meal} timeLabel={time} />
        ) : null}
        <TranscriptPanel
          meal={meal}
          timeLabel={time}
          partsLength={parts.length}
          panelId={meal.inputType === "photo" && meal.photoUrl ? "05" : "04"}
        />
      </div>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <div
      style={{
        marginTop: 24,
        padding: "14px 20px",
        border: `1px dashed ${CC.border}`,
        borderRadius: 3,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        color: CC.fg3,
        letterSpacing: "0.15em",
        textAlign: "center",
        textTransform: "uppercase",
      }}
    >
      ← prev · next → · esc to close
    </div>
  );
}
