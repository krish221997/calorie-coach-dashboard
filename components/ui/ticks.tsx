import * as React from "react";
import type { TickPos } from "@/types/ui";
import { CC } from "./tokens";

const PLACE: Record<TickPos, React.CSSProperties> = {
  tl: { top: -1, left: -1, borderWidth: "1px 0 0 1px" },
  tr: { top: -1, right: -1, borderWidth: "1px 1px 0 0" },
  bl: { bottom: -1, left: -1, borderWidth: "0 0 1px 1px" },
  br: { bottom: -1, right: -1, borderWidth: "0 1px 1px 0" },
};

const POSITIONS: TickPos[] = ["tl", "tr", "bl", "br"];

export function Ticks({ color, size = 8 }: { color?: string; size?: number }) {
  const c = color ?? CC.borderStrong;
  return (
    <>
      {POSITIONS.map((p) => (
        <span
          key={p}
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderColor: c,
            borderStyle: "solid",
            ...PLACE[p],
          }}
        />
      ))}
    </>
  );
}
