export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: string,
  ) {
    super(message);
  }
}

export type HttpClientOptions = {
  baseUrl?: string;
  defaultHeaders?: HeadersInit;
  defaultInit?: RequestInit;
};

export class HttpClient {
  private readonly baseUrl?: string;
  private readonly defaultHeaders: HeadersInit;
  private readonly defaultInit: RequestInit;

  constructor(options: HttpClientOptions = {}) {
    this.baseUrl = options.baseUrl;
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.defaultInit = options.defaultInit ?? {};
  }

  async request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.requestRaw(path, init);

    if (response.status === 204) {
      return undefined as T;
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength === "0" || response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    const body = await response.text();
    return body as unknown as T;
  }

  async requestRaw(path: string, init: RequestInit = {}): Promise<Response> {
    const url = this.resolveUrl(path);

    const response = await fetch(url, {
      cache: "no-store",
      ...this.defaultInit,
      ...init,
      headers: {
        ...this.defaultHeaders,
        ...(this.defaultInit.headers ?? {}),
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      let message = `HTTP ${response.status}`;
      try {
        const json = body ? JSON.parse(body) : undefined;
        message =
          json?.error ||
          json?.detail ||
          json?.message ||
          json?.msg ||
          message;
      } catch {
        // ignore JSON parse failures
      }
      throw new HttpError(`${message} @ ${url}`, response.status, body);
    }

    return response;
  }

  private resolveUrl(path: string): string {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    if (!this.baseUrl) {
      return path;
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }
}
