import * as React from "react";
import Link from "next/link";

export function ConnectionBanner({
  kind,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  kind: "error" | "warning";
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  const accent = kind === "error" ? "var(--cc-red)" : "var(--cc-yellow)";
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "14px 18px",
        border: `1px solid ${accent}`,
        background: `color-mix(in srgb, ${accent} 12%, transparent)`,
        color: "var(--cc-fg)",
        borderRadius: 4,
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: accent,
          }}
        >
          ● {kind === "error" ? "ERROR" : "WARNING"} · {title}
        </div>
        <div style={{ fontSize: 13, color: "var(--cc-fg2)", lineHeight: 1.5 }}>
          {description}
        </div>
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            alignSelf: "center",
            padding: "6px 12px",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: accent,
            border: `1px solid ${accent}`,
            borderRadius: 3,
            textDecoration: "none",
          }}
        >
          {actionLabel} →
        </Link>
      ) : null}
    </div>
  );
}
