import type { DailyTargets, DayTotals, Meal } from "./meals";

export interface DashboardData {
  TARGETS: DailyTargets;
  todayMeals: Meal[];
  todayTotals: DayTotals;
  DAYS: DayTotals[];
  MEALS: Meal[];
  streak: number;
  lastIngest?: string;
  connectionOk: boolean;
  fetchError: string | null;
  envMissing: { secret: boolean; source: boolean };
}
