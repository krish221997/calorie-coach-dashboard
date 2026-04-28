"use client";

import * as React from "react";
import { CC } from "@/components/ui";
import type { LogFilter } from "@/types/ui";

const FILTERS: LogFilter[] = ["ALL", "TEXT", "PHOTO", "VOICE"];

export function LogFilters({
  value,
  onChange,
}: {
  value: LogFilter;
  onChange: (f: LogFilter) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {FILTERS.map((f) => {
        const active = value === f;
        return (
          <button
            key={f}
            type="button"
            onClick={() => onChange(f)}
            style={{
              background: active ? CC.yellow : "transparent",
              color: active ? "#0E0E0D" : CC.fg2,
              border: `1px solid ${active ? CC.yellow : CC.border}`,
              padding: "6px 14px",
              borderRadius: 3,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.2em",
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        );
      })}
    </div>
  );
}
