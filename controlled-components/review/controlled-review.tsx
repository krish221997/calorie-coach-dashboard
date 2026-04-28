import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReviewScreen } from "@/components/review/review-screen";
import { loadDashboardData } from "@/lib/data/dashboard";

export async function ControlledReview() {
  const data = await loadDashboardData();
  return (
    <DashboardShell lastIngest={data.lastIngest}>
      <ReviewScreen DAYS={data.DAYS} TARGETS={data.TARGETS} />
    </DashboardShell>
  );
}
