import * as SecureStore from "expo-secure-store";

import { API_URL } from "./config";

async function errorMessage(response) {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail) && body.detail[0]?.msg) return body.detail[0].msg;
  } catch {
    // The server did not return JSON.
  }
  return `Request failed (${response.status})`;
}

async function refreshTokens() {
  const refreshToken = await SecureStore.getItemAsync("refresh_token");
  if (!refreshToken) return false;

  const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) return false;

  const tokens = await response.json();
  await SecureStore.setItemAsync("access_token", tokens.access_token);
  await SecureStore.setItemAsync("refresh_token", tokens.refresh_token);
  return true;
}

export async function request(path, options = {}, retry = true) {
  const headers = { ...(options.headers ?? {}) };
  const accessToken = await SecureStore.getItemAsync("access_token");
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401 && retry && (await refreshTokens())) {
    return request(path, options, false);
  }
  if (!response.ok) throw new Error(await errorMessage(response));
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  register(payload) {
    return request("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }, false);
  },
  login(email, password) {
    return request("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }, false);
  },
  me() {
    return request("/api/v1/auth/me");
  },
  samples() {
    return request("/api/v1/samples");
  },
  createSample(body) {
    return request("/api/v1/samples", { method: "POST", body });
  },
};

export function imageUrl(path) {
  return `${API_URL}${path}`;
}
