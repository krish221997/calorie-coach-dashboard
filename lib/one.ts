/**
 * One API client — tiny helpers around the One passthrough.
 *
 * Every request goes to `api.withone.ai` authenticated via the
 * `x-one-secret` header. The passthrough endpoint forwards the call to
 * the downstream platform (Notion, Slack, etc.) and injects the right
 * OAuth token server-side, so this client never holds per-platform
 * credentials.
 *
 * Endpoint contract confirmed from /Users/krishparekh/one/cli/src/lib/api.ts.
 */

export interface OneConnection {
  /** Internal DB id. */
  _id?: string;
  /** Platform slug (e.g. "notion", "deepgram"). */
  platform: string;
  /** Connection key you pass in the X-One-Connection-Key header. */
  key: string;
  /** "operational" when live. */
  state?: string;
  /** Human label, if the user named it. */
  name?: string;
}

interface VaultConnectionsResponse {
  rows: OneConnection[];
  total?: number;
  page?: number;
  pages?: number;
}

const ONE_API_BASE =
  process.env.ONE_API_BASE?.replace(/\/+$/, "") || "https://api.withone.ai/v1";

function getSecret(): string {
  const secret = process.env.ONE_SECRET;
  if (!secret) {
    throw new Error(
      "ONE_SECRET is not set. Add it to .env.local to authenticate with One."
    );
  }
  return secret;
}

async function oneRequest<T>(
  path: string,
  init: { method?: string; body?: unknown; headers?: Record<string, string> } = {}
): Promise<T> {
  const url = `${ONE_API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    "x-one-secret": getSecret(),
    Accept: "application/json",
    ...(init.headers || {}),
  };
  if (init.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method: init.method || "GET",
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  const raw = await res.text();
  let json: unknown = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    /* leave null */
  }

  if (!res.ok) {
    const snippet =
      typeof json === "object" && json
        ? JSON.stringify(json).slice(0, 400)
        : raw.slice(0, 400);
    throw new Error(`One API ${res.status} on ${path}: ${snippet}`);
  }
  return json as T;
}

/**
 * List the user's One connections, pagination handled. Filters to
 * operational by default.
 */
export async function listConnections(
  opts: { onlyOperational?: boolean } = {}
): Promise<OneConnection[]> {
  const all: OneConnection[] = [];
  let page = 1;
  let pages = 1;
  do {
    const resp = await oneRequest<VaultConnectionsResponse>(
      `/vault/connections?page=${page}&limit=100`
    );
    all.push(...(resp.rows || []));
    pages = resp.pages || 1;
    page++;
  } while (page <= pages);

  if (opts.onlyOperational === false) return all;
  // "state" is often undefined on healthy rows — treat missing as OK
  return all.filter((c) => !c.state || c.state === "operational");
}

/** Find a connection by platform slug. Returns null if not connected. */
export async function findConnection(
  platform: string
): Promise<OneConnection | null> {
  const rows = await listConnections();
  const match = rows.find((r) => r.platform === platform);
  return match ?? null;
}

/**
 * Call a downstream platform's native API via One's passthrough proxy.
 *
 * Required headers (enforced by One's API):
 *   x-one-secret          — account bearer
 *   x-one-connection-key  — identifies which OAuth connection to inject
 *   x-one-action-id       — which cataloged action maps to this call
 *
 * @param actionId       cataloged action ID from One's catalog
 * @param connectionKey  operational connection key for the target platform
 * @param targetPath     the downstream API path (e.g. "/data_sources/{id}/query")
 */
export async function passthrough<T = unknown>({
  actionId,
  connectionKey,
  targetPath,
  method = "POST",
  query,
  body,
  headers,
}: {
  actionId: string;
  connectionKey: string;
  targetPath: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, string | number | boolean>;
  body?: unknown;
  headers?: Record<string, string>;
}): Promise<T> {
  const normalizedTarget = targetPath.startsWith("/")
    ? targetPath
    : `/${targetPath}`;
  const url = new URL(
    `${ONE_API_BASE.replace(/\/v1$/, "")}/v1/passthrough${normalizedTarget}`
  );
  for (const [k, v] of Object.entries(query || {})) {
    url.searchParams.set(k, String(v));
  }

  const hdrs: Record<string, string> = {
    "x-one-secret": getSecret(),
    "x-one-connection-key": connectionKey,
    "x-one-action-id": actionId,
    Accept: "application/json",
    ...(headers || {}),
  };
  if (body !== undefined && !hdrs["Content-Type"]) {
    hdrs["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers: hdrs,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const raw = await res.text();
  let json: unknown = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    /* leave null */
  }

  if (!res.ok) {
    const snippet =
      typeof json === "object" && json
        ? JSON.stringify(json).slice(0, 400)
        : raw.slice(0, 400);
    throw new Error(
      `Passthrough ${res.status} on ${normalizedTarget}: ${snippet}`
    );
  }
  return json as T;
}
