"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireSession, { SignOutButton } from "@/components/auth/RequireSession";
import { fetchMe, isAdmin, type SessionUser } from "@/lib/api";

function AccountDetails() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetchMe().then(setUser).catch(() => setUser(null));
  }, []);

  if (!user) {
    return <main className="min-h-screen bg-earth-50" />;
  }

  const admin = isAdmin(user.role);

  return (
    <main className="min-h-screen bg-earth-50 px-4 py-16">
      <div className="mx-auto max-w-lg bg-white border border-earth-200 px-6 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-sans uppercase tracking-widest text-earth-500 mb-2">SPADE-AI</p>
            <h1 className="text-2xl font-serif text-earth-900">{user.name}</h1>
            <p className="text-sm font-sans text-earth-600 mt-1">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
        <p className="text-sm font-sans text-earth-700">
          {admin
            ? "This account is an administrator. You can open the Jashore map and create accounts for other people."
            : "You are signed in. The Jashore soil map is limited to administrators."}
        </p>
        {admin && (
          <div className="flex gap-4 mt-6 text-sm font-sans">
            <Link href="/maps/jessore" className="text-earth-900">
              Jashore map
            </Link>
            <Link href="/admin/users" className="text-earth-900">
              Create an account
            </Link>
          </div>
        )}
        <Link href="/" className="inline-block mt-8 text-sm font-sans text-earth-500 no-underline">
          Back to the site
        </Link>
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <RequireSession>
      <AccountDetails />
    </RequireSession>
  );
}
