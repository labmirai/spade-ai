import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";

import { api } from "./api";

const AuthContext = createContext(null);

async function saveTokens(tokens) {
  await SecureStore.setItemAsync("access_token", tokens.access_token);
  await SecureStore.setItemAsync("refresh_token", tokens.refresh_token);
}

async function clearTokens() {
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const accessToken = await SecureStore.getItemAsync("access_token");
      if (!accessToken) {
        if (active) setLoading(false);
        return;
      }
      try {
        const me = await api.me();
        if (active) setUser(me);
      } catch {
        await clearTokens();
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(email, password) {
      const tokens = await api.login(email, password);
      await saveTokens(tokens);
      setUser(await api.me());
    },
    async register(payload) {
      await api.register(payload);
      const tokens = await api.login(payload.email, payload.password);
      await saveTokens(tokens);
      setUser(await api.me());
    },
    async logout() {
      await clearTokens();
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
