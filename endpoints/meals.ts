import { NOTION_MEAL_PROP } from "@/lib/constants";
import type { InputType, Meal, MealType } from "@/types/meals";
import type { NotionPage } from "@/types/notion";
import { findNotionConnectionApi, queryNotionDataSourceApi } from "./notion";

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
  const props = page.properties;
  return {
    id: page.id,
    timestamp: readDate(props[NOTION_MEAL_PROP.TIMESTAMP]),
    title: readText(props[NOTION_MEAL_PROP.TITLE]),
    mealType: normalizeMealType(readSelect(props[NOTION_MEAL_PROP.MEAL_TYPE])),
    inputType: normalizeInputType(
      readSelect(props[NOTION_MEAL_PROP.INPUT_TYPE])
    ),
    items: readText(props[NOTION_MEAL_PROP.ITEMS]),
    rawInput: readText(props[NOTION_MEAL_PROP.RAW_INPUT]),
    transcript: readText(props[NOTION_MEAL_PROP.TRANSCRIPT]),
    kcal: readNumber(props[NOTION_MEAL_PROP.KCAL]),
    proteinG: readNumber(props[NOTION_MEAL_PROP.PROTEIN]),
    fatG: readNumber(props[NOTION_MEAL_PROP.FAT]),
    carbsG: readNumber(props[NOTION_MEAL_PROP.CARBS]),
    photoUrl: readFileUrl(props[NOTION_MEAL_PROP.PHOTO]),
    notionUrl: page.url,
  };
}

function getDataSourceId(): string {
  const id = process.env.NOTION_MEALS_DATA_SOURCE_ID;
  if (!id) {
    throw new Error(
      "NOTION_MEALS_DATA_SOURCE_ID is not set. Add it to .env.local."
    );
  }
  return id;
}

export async function fetchMealsApi(
  limit: number = 100
): Promise<{ meals: Meal[]; connectionOk: boolean }> {
  const notion = await findNotionConnectionApi();
  if (!notion) return { meals: [], connectionOk: false };

  const dataSourceId = getDataSourceId();
  const all: Meal[] = [];
  let cursor: string | null = null;

  while (all.length < limit) {
    const resp = await queryNotionDataSourceApi(notion.key, {
      dataSourceId,
      sorts: [{ property: "Timestamp", direction: "descending" }],
      pageSize: Math.min(100, limit - all.length),
      startCursor: cursor,
    });

    for (const page of resp.results) all.push(pageToMeal(page));
    if (!resp.has_more || !resp.next_cursor) break;
    cursor = resp.next_cursor;
  }

  return { meals: all, connectionOk: true };
}
