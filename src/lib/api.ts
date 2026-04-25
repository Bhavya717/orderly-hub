const BASE = "http://localhost:4000/api";
const TOKEN_KEY = "rb_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  requiresAuth = false
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (requiresAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  get: <T>(path: string, auth = false) => request<T>("GET", path, undefined, auth),
  post: <T>(path: string, body: unknown, auth = false) => request<T>("POST", path, body, auth),
  put: <T>(path: string, body: unknown, auth = false) => request<T>("PUT", path, body, auth),
  patch: <T>(path: string, body: unknown, auth = false) => request<T>("PATCH", path, body, auth),
  delete: <T>(path: string, auth = false) => request<T>("DELETE", path, undefined, auth),
};
