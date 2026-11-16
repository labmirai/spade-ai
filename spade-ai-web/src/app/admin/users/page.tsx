"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import RequireSession, { SignOutButton } from "@/components/auth/RequireSession";
import { canViewMap, createUser, isAdmin, listUsers, type ManagedUser } from "@/lib/api";

function UsersConsole() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "map" | "admin">("map");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    listUsers().then(setUsers).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load accounts");
    });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPending(true);
    try {
      const created = await createUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role,
      });
      setUsers((current) => [...current, created].sort((a, b) => a.id - b.id));
      setNotice(`${created.email} can sign in with the password you entered.`);
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("map");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-earth-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-sans uppercase tracking-widest text-earth-500 mb-2">SPADE-AI</p>
            <h1 className="text-2xl font-serif text-earth-900">Accounts</h1>
            <p className="text-sm font-sans text-earth-600 mt-1">
              Create an account, then the person signs in with that email and password.
            </p>
          </div>
          <SignOutButton />
        </div>

        <form onSubmit={onSubmit} className="bg-white border border-earth-200 px-6 py-6 grid gap-4 mb-6">
          <label className="grid gap-1 text-sm font-sans text-earth-700">
            Name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="border border-earth-300 px-3 py-2 text-earth-900"
            />
          </label>
          <label className="grid gap-1 text-sm font-sans text-earth-700">
            Email
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border border-earth-300 px-3 py-2 text-earth-900"
            />
          </label>
          <label className="grid gap-1 text-sm font-sans text-earth-700">
            Phone
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="border border-earth-300 px-3 py-2 text-earth-900"
            />
          </label>
          <label className="grid gap-1 text-sm font-sans text-earth-700">
            Password
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border border-earth-300 px-3 py-2 text-earth-900"
            />
          </label>
          <label className="grid gap-1 text-sm font-sans text-earth-700">
            Access
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as "user" | "map" | "admin")}
              className="border border-earth-300 px-3 py-2 text-earth-900 bg-white"
            >
              <option value="map">Map only</option>
              <option value="user">User, no map</option>
              <option value="admin">Administrator</option>
            </select>
          </label>
          {error && <p className="text-sm font-sans text-red-700">{error}</p>}
          {notice && <p className="text-sm font-sans text-earth-800">{notice}</p>}
          <button
            type="submit"
            disabled={pending}
            className="bg-earth-900 text-white font-sans text-sm py-2.5 disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create account"}
          </button>
        </form>

        <div className="bg-white border border-earth-200 overflow-x-auto">
          <table className="w-full text-sm font-sans text-left">
            <thead className="text-earth-500 border-b border-earth-200">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Access</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-earth-100">
                  <td className="px-4 py-2 text-earth-900">{user.name}</td>
                  <td className="px-4 py-2 text-earth-700">{user.email}</td>
                  <td className="px-4 py-2 text-earth-700">
                    {isAdmin(user.role) ? "Administrator" : canViewMap(user.role) ? "Map only" : "User"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4 mt-6 text-sm font-sans">
          <Link href="/maps/jessore" className="text-earth-700 no-underline">
            Jashore map
          </Link>
          <Link href="/" className="text-earth-500 no-underline">
            Back to the site
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function UsersPage() {
  return (
    <RequireSession adminOnly>
      <UsersConsole />
    </RequireSession>
  );
}
