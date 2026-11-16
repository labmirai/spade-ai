"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireSession from "@/components/auth/RequireSession";
import { canViewMap, fetchMe, isAdmin, type SessionUser } from "@/lib/api";

function formatJoined(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function ProfileDetails() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetchMe().then(setUser).catch(() => setUser(null));
  }, []);

  if (!user) {
    return <div className="min-h-[70vh] bg-earth-50" />;
  }

  const admin = isAdmin(user.role);
  const mapReader = canViewMap(user.role) && !admin;
  const joined = formatJoined(user.created_at);
  const rows: [string, string][] = [
    ["Email", user.email],
    ["Phone", user.phone?.trim() || "Not provided"],
    ["Role", admin ? "Administrator" : mapReader ? "Map only" : "User"],
  ];
  if (joined) rows.push(["Member since", joined]);

  return (
    <div className="min-h-[70vh] bg-earth-50 px-4 py-16">
      <div className="mx-auto max-w-lg bg-white border border-earth-200 px-6 py-8">
        <p className="text-xs font-sans uppercase tracking-widest text-earth-500 mb-2">Profile</p>
        <h1 className="text-2xl font-serif text-earth-900">{user.name}</h1>
        <dl className="mt-6">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-t border-earth-100 py-3 text-sm font-sans">
              <dt className="text-earth-500">{label}</dt>
              <dd className="text-earth-900 text-right">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm font-sans text-earth-700 mt-6">
          {admin
            ? "This account can open the Jashore data and create accounts for other people."
            : mapReader
              ? "This account can open the Jashore map. It cannot create accounts or open administrator pages."
              : "You are signed in. The Jashore soil map is not available for this account."}
        </p>
        {canViewMap(user.role) && (
          <div className="flex gap-4 mt-6 text-sm font-sans">
            <Link href="/maps/jessore" className="text-earth-900 no-underline">
              Jashore data
            </Link>
            {admin && (
              <Link href="/admin/users" className="text-earth-900 no-underline">
                Accounts
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireSession>
      <ProfileDetails />
    </RequireSession>
  );
}
