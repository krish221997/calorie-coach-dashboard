"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Ambient, CC } from "@/components/ui";
import { LeftRail } from "./left-rail";
import { TopBar } from "./top-bar";

const ROUTE_LABEL: Record<string, string> = {
  "/": "TODAY",
  "/review": "REVIEW · T-30d",
  "/streaks": "STREAKS",
  "/delta": "DELTA · W/W",
  "/log": "TRANSCRIPT",
  "/idle": "IDLE STATION",
};

function routeLabel(pathname: string): string {
  if (ROUTE_LABEL[pathname]) return ROUTE_LABEL[pathname];
  if (pathname.startsWith("/meal/")) return "PAYLOAD DETAIL";
  return pathname.slice(1).toUpperCase() || "TODAY";
}

export function DashboardShell({
  children,
  lastIngest,
}: {
  children: React.ReactNode;
  lastIngest?: string;
}) {
  const pathname = usePathname() ?? "/";
  const label = routeLabel(pathname);

  return (
    <>
      <LeftRail />
      <div
        style={{
          marginLeft: 96,
          position: "relative",
          minHeight: "100vh",
          background: CC.bg,
          color: CC.fg,
        }}
      >
        <Ambient />
        <div style={{ position: "relative", zIndex: 1 }}>
          <TopBar route={label} lastIngest={lastIngest} />
          {children}
        </div>
      </div>
    </>
  );
}
