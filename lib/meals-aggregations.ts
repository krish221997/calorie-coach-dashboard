import type { DailyTargets, DayTotals, Meal } from "@/types/meals";
import { TZ, fmtTime } from "./time";

const dayKeyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function localDateKey(iso: string): string {
  if (!iso) return "unknown";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  return dayKeyFmt.format(d);
}

export function todayKey(): string {
  return dayKeyFmt.format(new Date());
}

export function aggregateByDay(meals: Meal[]): DayTotals[] {
  const byDate = new Map<string, DayTotals>();
  for (const m of meals) {
    const key = localDateKey(m.timestamp);
    const current: DayTotals = byDate.get(key) || {
      date: key,
      kcal: 0,
      proteinG: 0,
      fatG: 0,
      carbsG: 0,
      mealCount: 0,
    };
    current.kcal += m.kcal;
    current.proteinG += m.proteinG;
    current.fatG += m.fatG;
    current.carbsG += m.carbsG;
    current.mealCount += 1;
    byDate.set(key, current);
  }
  return Array.from(byDate.values()).sort((a, b) =>
    a.date < b.date ? 1 : -1
  );
}

export function totalsForDate(meals: Meal[], dateKey: string): DayTotals {
  const todays = meals.filter((m) => localDateKey(m.timestamp) === dateKey);
  const base: DayTotals = {
    date: dateKey,
    kcal: 0,
    proteinG: 0,
    fatG: 0,
    carbsG: 0,
    mealCount: todays.length,
  };
  for (const m of todays) {
    base.kcal += m.kcal;
    base.proteinG += m.proteinG;
    base.fatG += m.fatG;
    base.carbsG += m.carbsG;
  }
  return base;
}

export function mealsForDate(meals: Meal[], dateKey: string): Meal[] {
  return meals
    .filter((m) => localDateKey(m.timestamp) === dateKey)
    .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
}

export function getDailyTargets(): DailyTargets {
  return {
    kcal: Number(process.env.DAILY_KCAL_TARGET || 2200),
    proteinG: Number(process.env.DAILY_PROTEIN_TARGET || 140),
    fatG: Number(process.env.DAILY_FAT_TARGET || 70),
    carbsG: Number(process.env.DAILY_CARBS_TARGET || 240),
  };
}

export function buildDaySeries(
  aggregate: DayTotals[],
  days: number
): DayTotals[] {
  const byKey = new Map<string, DayTotals>();
  for (const d of aggregate) byKey.set(d.date, d);

  const series: DayTotals[] = [];
  const now = new Date();
  const MS = 24 * 60 * 60 * 1000;
  for (let i = 0; i < days; i++) {
    const key = dayKeyFmt.format(new Date(now.getTime() - i * MS));
    series.push(
      byKey.get(key) ?? {
        date: key,
        kcal: 0,
        proteinG: 0,
        fatG: 0,
        carbsG: 0,
        mealCount: 0,
      }
    );
  }
  return series;
}

export function computeStreak(series: DayTotals[]): number {
  let n = 0;
  for (const d of series) {
    if (d.mealCount > 0) n++;
    else break;
  }
  return n;
}

export function latestIngestClock(meals: Meal[]): string | undefined {
  const times = meals
    .map((m) => m.timestamp)
    .filter(Boolean)
    .sort();
  if (times.length === 0) return undefined;
  return fmtTime(times[times.length - 1]);
}
