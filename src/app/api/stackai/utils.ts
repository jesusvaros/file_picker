export type Resource = {
  resource_id: string;
  inode_type: "directory" | "file";
  inode_path: {
    path: string;
  };
  created_at?: string;
  modified_at?: string;
};

export type StackConnection = {
  connection_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  org_id: string;
};

export type SelectedResource = {
  resource_id: string;
  inode_type: string;
  path: string;
};

export function getResourceName(resource: Resource): string {
  return (
    resource.inode_path?.path?.split("/").filter(Boolean).pop() ??
    resource.inode_path?.path ??
    ""
  );
}

export type Paginated<T> = {
  data: T[];
  next_cursor?: string | null;
  current_cursor?: string | null;
};

let cachedToken: { token: string; expAt: number } | null = null;

export async function getAccessToken() {
  const AUTH_URL = process.env.STACK_AI_AUTH_URL!;
  const ANON_KEY = process.env.STACK_AI_ANON_KEY!;
  const email = process.env.STACK_AI_EMAIL!;
  const password = process.env.STACK_AI_PASSWORD!;

  const now = Date.now();
  if (cachedToken && cachedToken.expAt > now + 10_000) {
    return cachedToken.token;
  }

  const resp = await fetch(`${AUTH_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Apikey: ANON_KEY,
    },
    body: JSON.stringify({
      email,
      password,
      gotrue_meta_security: {},
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Auth failed: ${resp.status} ${text}`);
  }

  const json = await resp.json();
  const token = json.access_token as string;
  const expiresIn = (json.expires_in as number) ?? 3600;
  cachedToken = { token, expAt: Date.now() + expiresIn * 1000 };
  return token;
}

export class UpstreamError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: string,
  ) {
    super(message);
  }
}

export async function stackFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await getAccessToken();
  const BASE = process.env.STACK_AI_BACKEND_URL;
  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let msg = `Upstream ${response.status}`;
    try {
      const json = text ? JSON.parse(text) : undefined;
      msg =
        (json?.error as string) ||
        (json?.detail as string) ||
        (json?.message as string) ||
        msg;
    } catch {}
    throw new UpstreamError(`${msg} @ ${url}`, response.status, text);
  }

  // Handle empty bodies (e.g., 204 from DELETE)
  const contentLength = response.headers.get("content-length");
  if (response.status === 204 || contentLength === "0") {
    return undefined as T;
  }
  return (await response.json()) as T;
}
