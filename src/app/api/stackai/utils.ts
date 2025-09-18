
export type StackResource = {
    resource_id: string;
    inode_type: "directory" | "file";
    inode_path: { path: string };
    created_at?: string;
    updated_at?: string;
  };
  
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
  
  export async function stackFetch<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const token = await getAccessToken();
    const BASE = process.env.STACK_AI_BACKEND_URL!;
    const resp = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`StackFetch ${path} -> ${resp.status} ${text}`);
    }
    return resp.json();
  }
  