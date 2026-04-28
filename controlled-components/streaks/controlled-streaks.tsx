import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StreaksScreen } from "@/components/streaks/streaks-screen";
import { loadDashboardData } from "@/lib/data/dashboard";

export async function ControlledStreaks() {
  const data = await loadDashboardData();
  return (
    <DashboardShell lastIngest={data.lastIngest}>
      <StreaksScreen
        DAYS={data.DAYS}
        TARGETS={data.TARGETS}
        streak={data.streak}
      />
    </DashboardShell>
  );
}
