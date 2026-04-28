"use client";

import * as React from "react";
import { CC, Kicker, Panel } from "@/components/ui";
import type { Meal } from "@/types/meals";
import type { LogFilter } from "@/types/ui";
import { LogFilters } from "./log-filters";
import { LogRow } from "./log-row";

export interface LogScreenProps {
  MEALS: Meal[];
}

function applyFilter(meals: Meal[], filter: LogFilter): Meal[] {
  if (filter === "ALL") return meals;
  return meals.filter((m) => m.inputType === filter.toLowerCase());
}

export function LogScreen({ MEALS }: LogScreenProps) {
  const [filter, setFilter] = React.useState<LogFilter>("ALL");
  const recent = MEALS.slice(0, 50);
  const filtered = applyFilter(recent, filter);

  return (
    <div
      className="cc-screen"
      style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}
    >
      <Header total={MEALS.length} />
      <LogFilters value={filter} onChange={setFilter} />
      <Panel
        id="01"
        title="LIVE FEED"
        right={`${filtered.length} SHOWING · ↓ NEWEST FIRST`}
        pad={0}
      >
        <LogFeed meals={filtered} />
      </Panel>
    </div>
  );
}

function Header({ total }: { total: number }) {
  return (
    <div>
      <Kicker>
        TRANSCRIPT · COACH ↔ YOU · ALL TIME · {total} EVENTS
      </Kicker>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 64,
          lineHeight: 0.95,
          letterSpacing: "-0.025em",
          marginTop: 10,
          color: CC.fg,
          maxWidth: 1100,
        }}
      >
        Every message,{" "}
        <em style={{ color: CC.fg2 }}>ingested and logged.</em>
      </div>
    </div>
  );
}

function LogFeed({ meals }: { meals: Meal[] }) {
  if (meals.length === 0) {
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
  return (
    <div style={{ maxHeight: 680, overflow: "auto", padding: "4px 20px 20px" }}>
      {meals.map((m) => (
        <LogRow key={m.id} meal={m} />
      ))}
    </div>
  );
}
