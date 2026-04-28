export interface OneConnection {
  key: string;
  platform: string;
  active: boolean;
  identity?: string;
  identityType?: string;
  updatedAt?: number;
  updatedAtUtc?: string;
}

export interface OneConnectionsResponse {
  rows: OneConnection[];
  pages: number;
}

export interface PassthroughRequestParams<TBody = unknown> {
  actionId: string;
  connectionKey: string;
  targetPath: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: TBody;
  headers?: Record<string, string>;
}
