let cachedToken: { token: string; expAt: number } | null = null;

export async function getStackAccessToken(): Promise<string> {
  const authUrl = process.env.STACK_AI_AUTH_URL;
  const anonKey = process.env.STACK_AI_ANON_KEY;
  const email = process.env.STACK_AI_EMAIL;
  const password = process.env.STACK_AI_PASSWORD;

  if (!authUrl || !anonKey || !email || !password) {
    throw new Error("Missing Stack AI authentication environment variables");
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expAt > now + 10_000) {
    return cachedToken.token;
  }

  const response = await fetch(
    `${authUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Apikey: anonKey,
      },
      body: JSON.stringify({ email, password, gotrue_meta_security: {} }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Auth failed: ${response.status} ${text}`);
  }

  const json = await response.json();
  const token = json.access_token as string;
  const expiresIn = (json.expires_in as number) ?? 3600;

  cachedToken = { token, expAt: Date.now() + expiresIn * 1000 };
  return token;
}
