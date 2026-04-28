export const TZ = "Asia/Kolkata";

const clockFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dayKeyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function fmtClock(d: Date): string {
  return clockFmt.format(d);
}

export function fmtTime(iso: string): string {
  if (!iso) return "--:--";
  return timeFmt.format(new Date(iso));
}

export function fmtDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
): string {
  return new Date(iso).toLocaleDateString("en-GB", { timeZone: TZ, ...opts });
}

export function istHourFraction(iso: string): number {
  if (!iso) return 0;
  const parts = timeFmt.formatToParts(new Date(iso));
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return (h + m / 60) / 24;
}

export function istDateKey(iso: string): string {
  if (!iso) return "";
  return dayKeyFmt.format(new Date(iso));
}
