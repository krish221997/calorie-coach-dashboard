import * as React from "react";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MealScreen } from "@/components/meal/meal-screen";
import { loadDashboardData } from "@/lib/data/dashboard";
import { istDateKey } from "@/lib/time";

export async function ControlledMeal({ mealId }: { mealId: string }) {
  const data = await loadDashboardData();
  const meal = data.MEALS.find((m) => m.id === mealId);
  if (!meal) notFound();

  const mealDay = istDateKey(meal.timestamp);
  const dayMeals = data.MEALS.filter(
    (m) => istDateKey(m.timestamp) === mealDay
  );
  const dayKcal = dayMeals.reduce((s, m) => s + m.kcal, 0);
  const allIds = data.MEALS.map((m) => m.id);

  return (
    <DashboardShell lastIngest={data.lastIngest}>
      <MealScreen meal={meal} allIds={allIds} dayKcal={dayKcal} />
    </DashboardShell>
  );
}
