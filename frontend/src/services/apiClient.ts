export const API_BASE =
  process.env.REACT_APP_API_URL?.replace(/\/+$/, "") || "http://localhost:5062";

const TOKEN_KEY = "bm.authToken";
const USER_KEY = "bm.authUser";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): string | null {
  return localStorage.getItem(USER_KEY);
}

export function setStoredUser(json: string | null): void {
  if (json) localStorage.setItem(USER_KEY, json);
  else localStorage.removeItem(USER_KEY);
}

export interface ApiFetchInit extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch(path: string, init: ApiFetchInit = {}): Promise<Response> {
  const { skipAuth, headers, ...rest } = init;
  const finalHeaders = new Headers(headers || {});
  if (!finalHeaders.has("Content-Type") && rest.body) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (!skipAuth) {
    const token = getToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders });
  return res;
}

export async function apiJson<T>(path: string, init?: ApiFetchInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
      else if (body?.errors) {
        const errs = Array.isArray(body.errors)
          ? body.errors
          : Object.values(body.errors).flat();
        message = (errs as string[]).join(" ") || message;
      }
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}
