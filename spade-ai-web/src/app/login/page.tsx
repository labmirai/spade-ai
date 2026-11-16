"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { canViewMap, isAdmin, login, safeNextPath } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const user = await login(email.trim(), password);
      const requested = searchParams.get("next");
      const next = safeNextPath(requested);
      if (isAdmin(user.role)) {
        router.replace(next);
        return;
      }
      if (canViewMap(user.role)) {
        router.replace(requested?.startsWith("/admin") ? "/maps/jessore" : next);
        return;
      }
      const blocked = !requested || requested.startsWith("/maps") || requested.startsWith("/admin");
      router.replace(blocked ? "/profile" : next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-earth-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white border border-earth-200 px-6 py-8">
        <p className="text-xs font-sans uppercase tracking-widest text-earth-500 mb-3">SPADE-AI</p>
        <h1 className="text-2xl font-serif text-earth-900 mb-2">Sign in</h1>
        <p className="text-sm font-sans text-earth-600 mb-6">
          Use the email and password for your SPADE-AI account.
        </p>
        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="grid gap-1 text-sm font-sans text-earth-700">
            Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border border-earth-300 px-3 py-2 text-earth-900"
            />
          </label>
          <label className="grid gap-1 text-sm font-sans text-earth-700">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border border-earth-300 px-3 py-2 text-earth-900"
            />
          </label>
          {error && <p className="text-sm font-sans text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="bg-earth-900 text-white font-sans text-sm py-2.5 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <Link href="/" className="inline-block mt-6 text-sm font-sans text-earth-500 no-underline">
          Back to the site
        </Link>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-earth-50" />}>
      <LoginForm />
    </Suspense>
  );
}
