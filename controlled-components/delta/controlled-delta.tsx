import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DeltaScreen } from "@/components/delta/delta-screen";
import { loadDashboardData } from "@/lib/data/dashboard";

export async function ControlledDelta() {
  const data = await loadDashboardData();
  return (
    <DashboardShell lastIngest={data.lastIngest}>
      <DeltaScreen DAYS={data.DAYS} TARGETS={data.TARGETS} />
    </DashboardShell>
  );
}
