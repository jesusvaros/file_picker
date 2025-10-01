import { HttpClient } from "@/services/http";
import { getStackAccessToken } from "./auth";

const baseUrl = process.env.STACK_AI_BACKEND_URL;

if (!baseUrl) {
  throw new Error("Missing STACK_AI_BACKEND_URL environment variable");
}

const stackHttp = new HttpClient({
  baseUrl,
  defaultHeaders: {
    Accept: "application/json",
  },
});

export async function stackRequest<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await getStackAccessToken();
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    ...(init.headers ?? {}),
  };

  return stackHttp.request<T>(path, {
    ...init,
    headers,
  });
}

export async function stackRequestRaw(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getStackAccessToken();
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    ...(init.headers ?? {}),
  };

  return stackHttp.requestRaw(path, {
    ...init,
    headers,
  });
}
