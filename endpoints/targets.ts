import { NOTION_PLATFORM } from "@/lib/constants";
import type { DailyTargets } from "@/types/meals";
import { findConnectionApi } from "./one";
import { queryNotionDataSourceApi } from "./notion";

const TARGETS_PROP = {
  ACTIVE: "Active",
  KCAL: "Kcal",
  PROTEIN: "Protein (g)",
  FAT: "Fat (g)",
  CARBS: "Carbs (g)",
} as const;

function readNumber(prop: unknown): number {
  if (!prop || typeof prop !== "object") return 0;
  const p = prop as { number?: number | null };
  return typeof p.number === "number" ? p.number : 0;
}

function readCheckbox(prop: unknown): boolean {
  if (!prop || typeof prop !== "object") return false;
  const p = prop as { checkbox?: boolean };
  return p.checkbox === true;
}

function getTargetsDataSourceId(): string | null {
  return process.env.NOTION_TARGETS_DATA_SOURCE_ID || null;
}

/**
 * Query the Targets data source and return the active row.
 * Returns null if the env var isn't set, the Notion connection isn't
 * operational, or no active row exists.
 *
 * The PATCH path lives in the `apply-targets` agent skill (see
 * skills/apply-targets.md), not in dashboard code — the dashboard is
 * read-only.
 */
export async function fetchActiveTargetsApi(): Promise<DailyTargets | null> {
  const dataSourceId = getTargetsDataSourceId();
  if (!dataSourceId) return null;

  const notion = await findConnectionApi(NOTION_PLATFORM);
  if (!notion) return null;

  const resp = await queryNotionDataSourceApi(notion.key, {
    dataSourceId,
    pageSize: 50,
  });

  for (const page of resp.results) {
    const props = page.properties;
    if (!readCheckbox(props[TARGETS_PROP.ACTIVE])) continue;
    return {
      kcal: readNumber(props[TARGETS_PROP.KCAL]),
      proteinG: readNumber(props[TARGETS_PROP.PROTEIN]),
      fatG: readNumber(props[TARGETS_PROP.FAT]),
      carbsG: readNumber(props[TARGETS_PROP.CARBS]),
    };
  }
  return null;
}
