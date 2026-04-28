import * as React from "react";
import { ConnectionBanner } from "@/components/ui";
import type { DashboardData } from "@/types/dashboard";

export function pickBanner(data: DashboardData): React.ReactNode {
  const { envMissing, connectionOk, fetchError } = data;

  if (envMissing.secret || envMissing.source) {
    return (
      <ConnectionBanner
        kind="error"
        title="Missing environment"
        description={[
          envMissing.secret ? "ONE_SECRET is not set." : null,
          envMissing.source ? "NOTION_MEALS_DATA_SOURCE_ID is not set." : null,
          "Copy .env.example → .env.local and fill them in.",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    );
  }

  if (fetchError) {
    return (
      <ConnectionBanner
        kind="error"
        title="Couldn't load meals"
        description={fetchError}
      />
    );
  }

  if (!connectionOk) {
    return (
      <ConnectionBanner
        kind="warning"
        title="Notion not connected in One"
        description="Add a Notion connection in your One dashboard and make sure it's marked operational."
        actionHref="https://app.withone.ai"
        actionLabel="Open One"
      />
    );
  }

  return null;
}
