export const NOTION_VERSION = "2026-03-11";

export const NOTION_PLATFORM = "notion";

/**
 * One catalog action ID for Notion's "Query a Data Source's Pages" endpoint.
 * Look this up via `one actions search notion "query data source"`.
 */
export const NOTION_QUERY_DATA_SOURCE_ACTION =
  "conn_mod_def::GJ5EnL2xERY::ib0N5v41TveieFZQUV-vuQ";

export const NOTION_MEAL_PROP = {
  TITLE: "Meal",
  ITEMS: "Items",
  RAW_INPUT: "Raw Input",
  TRANSCRIPT: "Transcript",
  MEAL_TYPE: "Meal Type",
  INPUT_TYPE: "Input Type",
  TIMESTAMP: "Timestamp",
  KCAL: "kcal",
  PROTEIN: "Protein (g)",
  FAT: "Fat (g)",
  CARBS: "Carbs (g)",
  PHOTO: "Photo",
} as const;
