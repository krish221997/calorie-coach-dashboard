import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { IdleScreen } from "@/components/idle/idle-screen";
import { StationActive } from "@/components/idle/station-active";
import { loadDashboardData } from "@/lib/data/dashboard";

export async function ControlledIdle() {
  const data = await loadDashboardData();
  const hasEventsToday = data.todayMeals.length > 0;

  return (
    <DashboardShell lastIngest={data.lastIngest}>
      {hasEventsToday ? (
        <StationActive
          todayMeals={data.todayMeals}
          todayKcal={data.todayTotals.kcal}
          targetKcal={data.TARGETS.kcal}
        />
      ) : (
        <IdleScreen DAYS={data.DAYS} />
      )}
    </DashboardShell>
  );
}
