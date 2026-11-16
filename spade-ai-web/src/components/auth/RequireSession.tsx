"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchMe, isAdmin, logout, type SessionUser } from "@/lib/api";

export default function RequireSession({
  adminOnly = false,
  children,
}: {
  adminOnly?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((next) => {
        if (cancelled) return;
        if (!next) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        setUser(next);
      })
      .catch(() => {
        if (!cancelled) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!user) {
    return <div className="min-h-screen bg-earth-50" />;
  }

  if (adminOnly && !isAdmin(user.role)) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center px-4">
        <div className="max-w-md bg-white border border-earth-200 px-6 py-8">
          <h1 className="text-2xl font-serif text-earth-900 mb-2">Administrators only</h1>
          <p className="text-sm font-sans text-earth-600 mb-4">
            Only an administrator can create accounts.
          </p>
          <Link href="/profile" className="text-sm font-sans text-earth-900">
            Your profile
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        logout();
        router.replace("/login");
      }}
      className="text-sm font-sans text-earth-600 bg-transparent border border-earth-300 px-3 py-1.5"
    >
      Sign out
    </button>
  );
}
