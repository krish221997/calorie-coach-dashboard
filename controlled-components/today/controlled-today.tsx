import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TodayScreen } from "@/components/today/today-screen";
import { loadDashboardData } from "@/lib/data/dashboard";
import { pickBanner } from "@/controlled-components/shared/pick-banner";

export async function ControlledToday() {
  const data = await loadDashboardData();
  const banner = pickBanner(data);

  return (
    <DashboardShell lastIngest={data.lastIngest}>
      {banner ? <div style={{ padding: "24px 28px 0" }}>{banner}</div> : null}
      <TodayScreen
        todayTotals={data.todayTotals}
        todayMeals={data.todayMeals}
        TARGETS={data.TARGETS}
      />
    </DashboardShell>
  );
}
