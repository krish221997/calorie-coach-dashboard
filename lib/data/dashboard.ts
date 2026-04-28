import { fetchMealsApi } from "@/endpoints/meals";
import type { DashboardData } from "@/types/dashboard";
import {
  aggregateByDay,
  buildDaySeries,
  computeStreak,
  latestIngestClock,
  mealsForDate,
  todayKey,
  totalsForDate,
} from "../meals-aggregations";
import { loadTargets } from "./targets";

/**
 * Server-side data loader that composes meal fetching with the 90-day
 * window, today's slice, streak, and the banner-ready env status.
 * Called from controlled components (server) to feed stateless screens.
 */
export async function loadDashboardData(): Promise<DashboardData> {
  const TARGETS = await loadTargets();
  const secret = !process.env.ONE_SECRET;
  const source = !process.env.NOTION_MEALS_DATA_SOURCE_ID;

  const empty: DashboardData = {
    TARGETS,
    todayMeals: [],
    todayTotals: {
      date: todayKey(),
      kcal: 0,
      proteinG: 0,
      fatG: 0,
      carbsG: 0,
      mealCount: 0,
    },
    DAYS: buildDaySeries([], 90),
    MEALS: [],
    streak: 0,
    lastIngest: undefined,
    connectionOk: false,
    fetchError: null,
    envMissing: { secret, source },
  };

  if (secret || source) return empty;

  try {
    const res = await fetchMealsApi(500);
    const key = todayKey();
    const DAYS = buildDaySeries(aggregateByDay(res.meals), 90);
    return {
      TARGETS,
      todayMeals: mealsForDate(res.meals, key),
      todayTotals: totalsForDate(res.meals, key),
      DAYS,
      MEALS: res.meals,
      streak: computeStreak(DAYS),
      lastIngest: latestIngestClock(res.meals),
      connectionOk: res.connectionOk,
      fetchError: null,
      envMissing: { secret: false, source: false },
    };
  } catch (err) {
    return {
      ...empty,
      fetchError: err instanceof Error ? err.message : String(err),
    };
  }
}
