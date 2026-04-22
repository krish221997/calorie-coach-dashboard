import * as React from "react";
import { DARK } from "./tokens";

/**
 * Small text label in mono caps — the "kicker" used on every panel.
 */
export function CKicker({
  children,
  color,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        color: color ?? DARK.fg2,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * Ambient background — drifting gradient + faint grid.
 * Pure CSS so it's fine in a Server Component.
 */
export function Ambient() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(60% 50% at 80% 15%, rgba(243,199,71,0.08), transparent 60%),
                       radial-gradient(45% 40% at 10% 85%, rgba(98,169,241,0.05), transparent 60%)`,
          animation: "ccDrift 20s linear infinite",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(${DARK.gridLine} 1px, transparent 1px),
                            linear-gradient(90deg, ${DARK.gridLine} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
    </>
  );
}

/**
 * Bordered corner tick — gives every panel the mission-control frame feel.
 */
function Tick({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base: React.CSSProperties = {
    position: "absolute",
    width: 8,
    height: 8,
    borderColor: "rgba(255,255,255,0.18)",
    borderStyle: "solid",
  };
  const map: Record<string, React.CSSProperties> = {
    tl: { top: -1, left: -1, borderWidth: "1px 0 0 1px" },
    tr: { top: -1, right: -1, borderWidth: "1px 1px 0 0" },
    bl: { bottom: -1, left: -1, borderWidth: "0 0 1px 1px" },
    br: { bottom: -1, right: -1, borderWidth: "0 1px 1px 0" },
  };
  return <span aria-hidden style={{ ...base, ...map[pos] }} />;
}

export function Panel({
  title,
  right,
  children,
  pad = 20,
  style,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  pad?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        border: `1px solid ${DARK.cardBorder}`,
        background: DARK.card,
        borderRadius: 6,
        padding: pad,
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <CKicker>{title}</CKicker>
        {right ? (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: DARK.fg2,
              letterSpacing: "0.1em",
            }}
          >
            {right}
          </span>
        ) : null}
      </div>
      {children}
      <Tick pos="tl" />
      <Tick pos="tr" />
      <Tick pos="bl" />
      <Tick pos="br" />
    </div>
  );
}
