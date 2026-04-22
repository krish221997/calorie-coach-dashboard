/**
 * Meals domain — types, fetchers, and aggregations over the Notion
 * "Meals" data source that the meal-logger skill writes to.
 *
 * Uses One's passthrough to call Notion's native
 * /data_sources/{id}/query endpoint so we never need a Notion SDK and
 * credentials stay server-side via the ONE_SECRET bearer.
 */

import { findConnection, passthrough } from "./one";

export type MealType = "breakfast" | "lunch" | "snack" | "dinner" | "unknown";
export type InputType = "text" | "photo" | "voice" | "unknown";

export interface Meal {
  id: string;
  timestamp: string;
  title: string;
  mealType: MealType;
  inputType: InputType;
  items: string;
  rawInput: string;
  transcript: string;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  photoUrl?: string;
  notionUrl?: string;
}

export interface DayTotals {
  date: string; // YYYY-MM-DD in local time
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  mealCount: number;
}

interface NotionPage {
  id: string;
  url?: string;
  properties: Record<string, unknown>;
}

interface NotionQueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

const NOTION_VERSION = "2026-03-11";
const NOTION_PLATFORM = "notion";

/** One catalog action IDs for Notion — copy from `one actions search`. */
const NOTION_QUERY_DATA_SOURCE_ACTION =
  "conn_mod_def::GJ5EnL2xERY::ib0N5v41TveieFZQUV-vuQ";

function getDataSourceId() {
  const id = process.env.NOTION_MEALS_DATA_SOURCE_ID;
  if (!id) {
    throw new Error(
      "NOTION_MEALS_DATA_SOURCE_ID is not set. Add it to .env.local (look it up in the Meals DB URL in Notion or via the create-database response)."
    );
  }
  return id;
}

function readText(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "";
  const p = prop as Record<string, unknown>;
  const arr = (p.title || p.rich_text) as
    | Array<{ plain_text?: string }>
    | undefined;
  if (Array.isArray(arr)) {
    return arr.map((r) => r.plain_text || "").join("");
  }
  return "";
}

function readSelect(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "";
  const p = prop as { select?: { name?: string } };
  return p.select?.name || "";
}

function readNumber(prop: unknown): number {
  if (!prop || typeof prop !== "object") return 0;
  const p = prop as { number?: number | null };
  return typeof p.number === "number" ? p.number : 0;
}

function readDate(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "";
  const p = prop as { date?: { start?: string } };
  return p.date?.start || "";
}

function readFileUrl(prop: unknown): string | undefined {
  if (!prop || typeof prop !== "object") return undefined;
  const p = prop as {
    files?: Array<{
      external?: { url?: string };
      file?: { url?: string };
      name?: string;
    }>;
  };
  const first = p.files?.[0];
  return first?.external?.url || first?.file?.url || undefined;
}

function normalizeMealType(raw: string): MealType {
  const v = raw.toLowerCase().trim();
  if (v === "breakfast" || v === "lunch" || v === "snack" || v === "dinner") {
    return v;
  }
  return "unknown";
}

function normalizeInputType(raw: string): InputType {
  const v = raw.toLowerCase().trim();
  if (v === "text" || v === "photo" || v === "voice") return v;
  return "unknown";
}

function pageToMeal(page: NotionPage): Meal {
  const props = page.properties as Record<string, unknown>;
  return {
    id: page.id,
    timestamp: readDate(props["Timestamp"]),
    title: readText(props["Meal"]),
    mealType: normalizeMealType(readSelect(props["Meal Type"])),
    inputType: normalizeInputType(readSelect(props["Input Type"])),
    items: readText(props["Items"]),
    rawInput: readText(props["Raw Input"]),
    transcript: readText(props["Transcript"]),
    kcal: readNumber(props["kcal"]),
    proteinG: readNumber(props["Protein (g)"]),
    fatG: readNumber(props["Fat (g)"]),
    carbsG: readNumber(props["Carbs (g)"]),
    photoUrl: readFileUrl(props["Photo"]),
    notionUrl: page.url,
  };
}

/**
 * Fetch all meals from the Notion data source, most recent first.
 * Handles Notion's pagination transparently. For large DBs this
 * streams all pages; for the calorie-coach use case a day has <10
 * meals so we rarely need more than one request.
 */
export async function fetchMeals(
  limit: number = 100
): Promise<{ meals: Meal[]; connectionOk: boolean }> {
  const notion = await findConnection(NOTION_PLATFORM);
  if (!notion) return { meals: [], connectionOk: false };

  const dataSourceId = getDataSourceId();
  const all: Meal[] = [];
  let cursor: string | null = null;

  while (all.length < limit) {
    const body: Record<string, unknown> = {
      sorts: [{ property: "Timestamp", direction: "descending" }],
      page_size: Math.min(100, limit - all.length),
    };
    if (cursor) body.start_cursor = cursor;

    const resp = await passthrough<NotionQueryResponse>({
      actionId: NOTION_QUERY_DATA_SOURCE_ACTION,
      connectionKey: notion.key,
      targetPath: `/data_sources/${dataSourceId}/query`,
      method: "POST",
      body,
      headers: { "Notion-Version": NOTION_VERSION },
    });

    for (const page of resp.results) all.push(pageToMeal(page));
    if (!resp.has_more || !resp.next_cursor) break;
    cursor = resp.next_cursor;
  }

  return { meals: all, connectionOk: true };
}

function localDateKey(iso: string): string {
  if (!iso) return "unknown";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return localDateKey(new Date().toISOString());
}

export function aggregateByDay(meals: Meal[]): DayTotals[] {
  const byDate = new Map<string, DayTotals>();
  for (const m of meals) {
    const key = localDateKey(m.timestamp);
    const current: DayTotals = byDate.get(key) || {
      date: key,
      kcal: 0,
      proteinG: 0,
      fatG: 0,
      carbsG: 0,
      mealCount: 0,
    };
    current.kcal += m.kcal;
    current.proteinG += m.proteinG;
    current.fatG += m.fatG;
    current.carbsG += m.carbsG;
    current.mealCount += 1;
    byDate.set(key, current);
  }
  return Array.from(byDate.values()).sort((a, b) =>
    a.date < b.date ? 1 : -1
  );
}

export function totalsForDate(meals: Meal[], dateKey: string): DayTotals {
  const todays = meals.filter((m) => localDateKey(m.timestamp) === dateKey);
  const base: DayTotals = {
    date: dateKey,
    kcal: 0,
    proteinG: 0,
    fatG: 0,
    carbsG: 0,
    mealCount: todays.length,
  };
  for (const m of todays) {
    base.kcal += m.kcal;
    base.proteinG += m.proteinG;
    base.fatG += m.fatG;
    base.carbsG += m.carbsG;
  }
  return base;
}

export function mealsForDate(meals: Meal[], dateKey: string): Meal[] {
  return meals
    .filter((m) => localDateKey(m.timestamp) === dateKey)
    .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
}

/** Daily targets used for progress bars. Can come from env or be overridden. */
export function getDailyTargets() {
  return {
    kcal: Number(process.env.DAILY_KCAL_TARGET || 2200),
    proteinG: Number(process.env.DAILY_PROTEIN_TARGET || 140),
    fatG: Number(process.env.DAILY_FAT_TARGET || 70),
    carbsG: Number(process.env.DAILY_CARBS_TARGET || 240),
  };
}
