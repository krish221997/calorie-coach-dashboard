import type {
  OneConnection,
  OneConnectionsResponse,
  PassthroughRequestParams,
} from "@/types/one";

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
  init: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
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

export async function listConnectionsApi(
  opts: { onlyOperational?: boolean } = {}
): Promise<OneConnection[]> {
  const all: OneConnection[] = [];
  let page = 1;
  let pages = 1;
  do {
    const resp = await oneRequest<OneConnectionsResponse>(
      `/vault/connections?page=${page}&limit=100`
    );
    all.push(...(resp.rows || []));
    pages = resp.pages || 1;
    page++;
  } while (page <= pages);

  if (opts.onlyOperational === false) return all;
  return all.filter((c) => c.active !== false);
}

export async function findConnectionApi(
  platform: string
): Promise<OneConnection | null> {
  const rows = await listConnectionsApi();
  return rows.find((r) => r.platform === platform) ?? null;
}

export async function passthroughApi<T = unknown>({
  actionId,
  connectionKey,
  targetPath,
  method = "POST",
  body,
  headers,
}: PassthroughRequestParams): Promise<T> {
  const normalizedTarget = targetPath.startsWith("/")
    ? targetPath
    : `/${targetPath}`;
  const url = new URL(
    `${ONE_API_BASE.replace(/\/v1$/, "")}/v1/passthrough${normalizedTarget}`
  );

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
