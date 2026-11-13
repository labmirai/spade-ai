const ACCESS_KEY = "spade.access";
const REFRESH_KEY = "spade.refresh";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

export function isAdmin(role: string): boolean {
  const value = role.toLowerCase();
  return value === "admin" || value.endsWith(".admin");
}

export function logout(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function readToken(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = readToken(REFRESH_KEY);
  if (!refreshToken) return false;
  const res = await fetch("/backend/api/v1/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) {
    logout();
    return false;
  }
  const data = (await res.json()) as { access_token: string; refresh_token: string };
  localStorage.setItem(ACCESS_KEY, data.access_token);
  localStorage.setItem(REFRESH_KEY, data.refresh_token);
  return true;
}

function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function errorDetail(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: unknown };
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      const first = body.detail[0] as { msg?: unknown } | undefined;
      if (typeof first?.msg === "string") return first.msg;
    }
  } catch {
    // The API sometimes returns an empty body.
  }
  return fallback;
}

export async function apiFetch(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const headers = new Headers(init.headers);
  const access = readToken(ACCESS_KEY);
  if (access) headers.set("Authorization", `Bearer ${access}`);
  const res = await fetch(`/backend${path}`, { ...init, headers, cache: "no-store" });
  if (res.status === 401 && retry && readToken(REFRESH_KEY)) {
    const ok = await refreshOnce();
    if (ok) return apiFetch(path, init, false);
  }
  return res;
}

export async function apiJson<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) {
    throw new Error(await errorDetail(res, `Request failed (${res.status})`));
  }
  return (await res.json()) as T;
}

export async function login(email: string, password: string): Promise<SessionUser> {
  const res = await fetch("/backend/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await errorDetail(res, "Could not sign in"));
  }
  const data = (await res.json()) as { access_token: string; refresh_token: string };
  localStorage.setItem(ACCESS_KEY, data.access_token);
  localStorage.setItem(REFRESH_KEY, data.refresh_token);
  return apiJson<SessionUser>("/api/v1/auth/me");
}

export type ManagedUser = SessionUser & {
  phone: string | null;
  created_at: string;
};

export async function listUsers(): Promise<ManagedUser[]> {
  return apiJson<ManagedUser[]>("/api/v1/users");
}

export async function createUser(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "admin" | "user";
}): Promise<ManagedUser> {
  const res = await apiFetch("/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await errorDetail(res, "Could not create the account"));
  }
  return (await res.json()) as ManagedUser;
}

export async function fetchMe(): Promise<SessionUser | null> {
  if (!readToken(ACCESS_KEY) && !readToken(REFRESH_KEY)) return null;
  const res = await apiFetch("/api/v1/auth/me");
  if (!res.ok) return null;
  return (await res.json()) as SessionUser;
}

export function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/maps/jessore";
  return value;
}
