import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LogScreen } from "@/components/log/log-screen";
import { loadDashboardData } from "@/lib/data/dashboard";

export async function ControlledLog() {
  const data = await loadDashboardData();
  return (
    <DashboardShell lastIngest={data.lastIngest}>
      <LogScreen MEALS={data.MEALS} />
    </DashboardShell>
  );
}
