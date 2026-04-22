import * as React from "react";
import { DARK } from "./tokens";
import { Ambient, CKicker, Panel } from "./primitives";
import { TopBar } from "./top-bar";
import { Telemetry } from "./telemetry";
import { MacroRing, MacroReadout, ChannelBar } from "./macro";
import { AltitudeChart, TrendStrip } from "./altitude-chart";
import { EventLog } from "./event-log";
import type { DayTotals, Meal } from "@/lib/meals";

export interface FutureTodayProps {
  totals: DayTotals;
  targets: {
    kcal: number;
    proteinG: number;
    fatG: number;
    carbsG: number;
  };
  todaysMeals: Meal[];
  days: DayTotals[];
  connections: { notion: boolean; one: boolean };
  banner?: React.ReactNode;
}

/**
 * Direction C — the whole "mission control" dashboard, composed of the
 * TopBar, a hero PRIMARY kcal panel with altitude chart, three macro
 * readouts, an event log, input-channel bars, and a 30-day trend strip.
 */
export function FutureToday({
  totals,
  targets,
  todaysMeals,
  days,
  connections,
  banner,
}: FutureTodayProps) {
  const kcalPct = targets.kcal > 0 ? totals.kcal / targets.kcal : 0;
  const remaining = Math.max(0, Math.round(targets.kcal - totals.kcal));

  const inputCounts = countInputs(todaysMeals);
  const lastIngest = latestIngestClock(todaysMeals);
  const eventCount = todaysMeals.length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: DARK.bg,
        color: DARK.fg,
        fontFamily: "var(--font-sans)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Ambient />
      <div style={{ position: "relative", zIndex: 1 }}>
        <TopBar connections={connections} lastIngest={lastIngest} />

        {banner ? (
          <div style={{ padding: "24px 32px 0" }}>{banner}</div>
        ) : null}

        {/* HERO ROW — PRIMARY kcal + three macro readouts */}
        <div
          style={{
            padding: "48px 32px 24px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: 28,
            alignItems: "stretch",
          }}
        >
          <Panel
            title="PRIMARY · KCAL · T+TODAY"
            right={`${Math.round(kcalPct * 100)}% OF TARGET`}
            pad={28}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                {/* Oversize DM Serif Display hero — the "five plates, a quarter past eight" energy */}
                <Telemetry value={Math.round(totals.kcal)} unit="kcal" size={156} />
                <div
                  style={{
                    marginTop: 14,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: DARK.fg2,
                    letterSpacing: "0.1em",
                  }}
                >
                  Δ {remaining} REMAINING · TARGET{" "}
                  {targets.kcal.toLocaleString()}
                </div>
              </div>
              <MacroRing pct={kcalPct} />
            </div>

            <AltitudeChart meals={todaysMeals} target={targets.kcal} />

            <div
              style={{
                marginTop: 28,
                display: "flex",
                gap: 20,
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                color: DARK.fg2,
                letterSpacing: "0.08em",
              }}
            >
              <span>
                <span style={{ color: DARK.yellow }}>●</span> cumulative intake
              </span>
              <span>
                <span style={{ color: DARK.yellow, opacity: 0.4 }}>––</span>{" "}
                target line
              </span>
              <span style={{ marginLeft: "auto" }}>
                sampling · {eventCount} event{eventCount === 1 ? "" : "s"}
              </span>
            </div>
          </Panel>

          <div
            style={{
              display: "grid",
              gridTemplateRows: "1fr 1fr 1fr",
              gap: 14,
            }}
          >
            <MacroReadout
              label="Protein"
              value={Math.round(totals.proteinG)}
              target={targets.proteinG}
              unit="g"
              color={DARK.yellow}
            />
            <MacroReadout
              label="Fat"
              value={Math.round(totals.fatG)}
              target={targets.fatG}
              unit="g"
              color={DARK.blue}
            />
            <MacroReadout
              label="Carbs"
              value={Math.round(totals.carbsG)}
              target={targets.carbsG}
              unit="g"
              color={DARK.green}
            />
          </div>
        </div>

        {/* SECONDARY ROW — event log + input channels */}
        <div
          style={{
            padding: "0 32px 24px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: 28,
          }}
        >
          <Panel
            title="EVENT LOG · TODAY"
            right={`${eventCount} event${eventCount === 1 ? "" : "s"}`}
          >
            <EventLog meals={todaysMeals} />
          </Panel>

          <Panel title="INPUT CHANNELS · 24H" right="TELEGRAM · LIVE">
            <ChannelBar
              label="Text"
              value={inputCounts.text}
              max={Math.max(5, inputCounts.text)}
              color={DARK.fg}
            />
            <ChannelBar
              label="Photo"
              value={inputCounts.photo}
              max={Math.max(5, inputCounts.photo)}
              color={DARK.yellow}
            />
            <ChannelBar
              label="Voice"
              value={inputCounts.voice}
              max={Math.max(5, inputCounts.voice)}
              color={DARK.blue}
            />
            <div
              style={{
                marginTop: 20,
                padding: 14,
                border: `1px dashed ${DARK.cardBorder}`,
                borderRadius: 4,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: DARK.fg2,
                lineHeight: 1.55,
              }}
            >
              &gt; AGENT {eventCount > 0 ? "ACTIVE" : "IDLE"}
              <br />
              &gt; LAST INGEST · T+{lastIngest ?? "--:--"}
              <br />
              &gt; WAITING FOR TELEGRAM
              <span aria-hidden style={{ animation: "ccBlink 1s infinite" }}>
                _
              </span>
            </div>
          </Panel>
        </div>

        {/* NOMINAL pill + 30-day trend */}
        <div style={{ padding: "0 32px 40px" }}>
          <NominalStrip eventCount={eventCount} />
          <div style={{ marginTop: 20 }}>
            <Panel
              title="TREND · 30 DAYS · KCAL"
              right={avgLabel(days)}
            >
              {days.length > 0 ? (
                <TrendStrip days={days} />
              ) : (
                <div
                  style={{
                    padding: "40px 0",
                    display: "grid",
                    placeItems: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: DARK.fg3,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  — no history —
                </div>
              )}
            </Panel>
          </div>

          <div
            style={{
              marginTop: 32,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: DARK.fg3,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            <span>CALORIE COACH — TELEMETRY · READ-ONLY · NOTION ↔ ONE ↔ TELEGRAM</span>
            <span>MMXXVI · STATION 01</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NominalStrip({ eventCount }: { eventCount: number }) {
  const ok = eventCount > 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        border: `1px solid ${DARK.cardBorder}`,
        background: "rgba(79,168,107,0.06)",
        borderRadius: 4,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: ok ? DARK.green : DARK.yellow,
          boxShadow: `0 0 10px ${ok ? DARK.green : DARK.yellow}`,
          animation: "ccBlink 2.5s infinite",
        }}
      />
      <CKicker color={ok ? DARK.green : DARK.yellow}>
        {ok ? "NOMINAL · ALL SYSTEMS GO" : "STANDBY · AWAITING FIRST EVENT"}
      </CKicker>
      <span
        style={{
          marginLeft: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: DARK.fg3,
          letterSpacing: "0.12em",
        }}
      >
        T+{eventCount} EVENTS TODAY
      </span>
    </div>
  );
}

function countInputs(meals: Meal[]) {
  const c = { text: 0, photo: 0, voice: 0 };
  for (const m of meals) {
    if (m.inputType === "text") c.text++;
    else if (m.inputType === "photo") c.photo++;
    else if (m.inputType === "voice") c.voice++;
  }
  return c;
}

function latestIngestClock(meals: Meal[]): string | undefined {
  const withTime = meals
    .map((m) => m.timestamp)
    .filter(Boolean)
    .sort();
  if (withTime.length === 0) return undefined;
  const d = new Date(withTime[withTime.length - 1]);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function avgLabel(days: DayTotals[]): string {
  if (days.length === 0) return "NO HISTORY";
  const avg = Math.round(
    days.reduce((s, d) => s + d.kcal, 0) / days.length
  );
  return `AVG ${avg.toLocaleString()} / DAY`;
}
