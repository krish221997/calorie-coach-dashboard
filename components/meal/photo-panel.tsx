import * as React from "react";
import { CC, Panel } from "@/components/ui";
import type { Meal } from "@/types/meals";

export function PhotoPanel({
  meal,
  timeLabel,
}: {
  meal: Meal;
  timeLabel: string;
}) {
  return (
    <Panel id="04" title="INGEST · PHOTO">
      <div
        style={{
          aspectRatio: "4/3",
          background: meal.photoUrl
            ? `center / cover no-repeat url(${CSS.escape(meal.photoUrl)})`
            : `linear-gradient(135deg, #2a2a28, #3a2d1c)`,
          border: `1px solid ${CC.border}`,
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {!meal.photoUrl && (
          <div
            style={{
              position: "absolute",
              inset: "18% 22%",
              borderRadius: "50%",
              background: `color-mix(in srgb, ${CC.yellow} 13%, transparent)`,
              border: `1px solid color-mix(in srgb, ${CC.yellow} 33%, transparent)`,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 12,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: CC.fg2,
            letterSpacing: "0.1em",
          }}
        >
          IMG_{meal.id.slice(-4).toUpperCase()}.JPG
        </div>
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: CC.yellow,
            letterSpacing: "0.1em",
          }}
        >
          ●REC T+{timeLabel}
        </div>
      </div>
    </Panel>
  );
}
