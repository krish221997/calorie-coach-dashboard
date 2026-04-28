import * as React from "react";
import { CC } from "./tokens";

export function Ambient() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: `radial-gradient(60% 50% at 78% 18%, ${CC.ambientA}, transparent 60%),
                       radial-gradient(45% 40% at 8% 82%, ${CC.ambientB}, transparent 60%)`,
          animation: "ccDrift 20s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `linear-gradient(${CC.gridLine} 1px, transparent 1px),
                            linear-gradient(90deg, ${CC.gridLine} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 85%)",
        }}
      />
    </>
  );
}
