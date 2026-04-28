export interface NotionPage {
  id: string;
  url?: string;
  properties: Record<string, unknown>;
}

export interface NotionQueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

export interface NotionQueryRequest {
  dataSourceId: string;
  sorts?: Array<{ property: string; direction: "ascending" | "descending" }>;
  filter?: Record<string, unknown>;
  pageSize?: number;
  startCursor?: string | null;
}
