import { fetchActiveTargetsApi } from "@/endpoints/targets";
import type { DailyTargets } from "@/types/meals";
import { getDailyTargets } from "../meals-aggregations";

/**
 * Returns the user's daily macro targets.
 *
 * Read order (server-side):
 *   1. Notion Targets data source — the active row.
 *      This is the canonical source. The Sunday-letter "apply-targets"
 *      skill writes here when the user accepts a suggestion, and the
 *      dashboard picks it up on the next refresh.
 *   2. env vars (DAILY_KCAL_TARGET, …) — fallback when Notion is not
 *      configured (env var unset, no active row, or the connection
 *      can't be reached).
 *
 * Never throws — falls back silently so the dashboard always renders.
 */
export async function loadTargets(): Promise<DailyTargets> {
  try {
    const fromNotion = await fetchActiveTargetsApi();
    if (fromNotion) return fromNotion;
  } catch {
    // intentionally swallow — fall through to env defaults
  }
  return getDailyTargets();
}
