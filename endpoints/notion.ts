import {
  NOTION_PLATFORM,
  NOTION_QUERY_DATA_SOURCE_ACTION,
  NOTION_VERSION,
} from "@/lib/constants";
import type {
  NotionQueryRequest,
  NotionQueryResponse,
} from "@/types/notion";
import { findConnectionApi, passthroughApi } from "./one";

export async function findNotionConnectionApi() {
  return findConnectionApi(NOTION_PLATFORM);
}

export async function queryNotionDataSourceApi(
  connectionKey: string,
  req: NotionQueryRequest
): Promise<NotionQueryResponse> {
  const body: Record<string, unknown> = {};
  if (req.sorts) body.sorts = req.sorts;
  if (req.filter) body.filter = req.filter;
  if (req.pageSize) body.page_size = req.pageSize;
  if (req.startCursor) body.start_cursor = req.startCursor;

  return passthroughApi<NotionQueryResponse>({
    actionId: NOTION_QUERY_DATA_SOURCE_ACTION,
    connectionKey,
    targetPath: `/data_sources/${req.dataSourceId}/query`,
    method: "POST",
    body,
    headers: { "Notion-Version": NOTION_VERSION },
  });
}
