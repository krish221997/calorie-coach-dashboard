"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNow } from "@/hooks/ui/use-now";
import { fmtClock } from "@/lib/time";
import { CC, LED } from "@/components/ui";
import { useTheme } from "./theme-provider";

const ITEMS: { href: string; label: string; sub: string }[] = [
  { href: "/", label: "TODAY", sub: "01" },
  { href: "/review", label: "REVIEW", sub: "02" },
  { href: "/streaks", label: "STREAKS", sub: "03" },
  { href: "/delta", label: "DELTA", sub: "04" },
  { href: "/log", label: "LOG", sub: "05" },
  { href: "/idle", label: "IDLE", sub: "06" },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function LeftRail() {
  const pathname = usePathname() ?? "/";
  const now = useNow(1000);
  const { mode, toggle } = useTheme();

  return (
    <div
      style={{
        width: 96,
        background: CC.bg2,
        borderRight: `1px solid ${CC.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        zIndex: 10,
      }}
    >
      <div
        style={{
          padding: "0 16px 20px",
          borderBottom: `1px solid ${CC.border}`,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <LED color="green" label="ONLINE" />
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: CC.fg3,
            letterSpacing: "0.2em",
          }}
        >
          T+
          <br />
          <span style={{ color: CC.fg, fontSize: 11, letterSpacing: "0.1em" }}>
            {fmtClock(now)}
          </span>
        </div>
      </div>

      <nav
        style={{
          flex: 1,
          padding: "16px 0",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {ITEMS.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              style={{
                textDecoration: "none",
                padding: "14px 12px",
                textAlign: "center",
                position: "relative",
                borderLeft: `2px solid ${active ? CC.yellow : "transparent"}`,
                color: active ? CC.fg : CC.fg2,
                transition: "background .15s, color .15s",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: CC.fg3,
                  letterSpacing: "0.2em",
                  marginBottom: 4,
                }}
              >
                {it.sub}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                }}
              >
                {it.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          padding: "16px",
          borderTop: `1px solid ${CC.border}`,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={toggle}
          style={{
            background: "none",
            border: `1px solid ${CC.border}`,
            color: CC.fg2,
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: 3,
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {mode === "dark" ? "DRK" : "LGT"}
        </button>
      </div>
    </div>
  );
}
