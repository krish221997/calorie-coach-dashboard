import * as React from "react";
import { Kicker } from "./kicker";
import { Ticks } from "./ticks";
import { CC } from "./tokens";

export function Panel({
  title,
  right,
  children,
  pad = 20,
  style,
  id,
}: {
  title?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  pad?: number;
  style?: React.CSSProperties;
  id?: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${CC.border}`,
        background: CC.card,
        borderRadius: 4,
        padding: pad,
        position: "relative",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        ...style,
      }}
    >
      {(title || right) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {id && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: CC.fg3,
                  letterSpacing: "0.2em",
                }}
              >
                [{id}]
              </span>
            )}
            {title ? <Kicker>{title}</Kicker> : null}
          </div>
          {right ? (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: CC.fg2,
                letterSpacing: "0.1em",
              }}
            >
              {right}
            </span>
          ) : null}
        </div>
      )}
      {children}
      <Ticks />
    </div>
  );
}
