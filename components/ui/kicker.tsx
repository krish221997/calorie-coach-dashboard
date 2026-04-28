import * as React from "react";
import { CC } from "./tokens";

export function Kicker({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        color: color ?? CC.fg2,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}
