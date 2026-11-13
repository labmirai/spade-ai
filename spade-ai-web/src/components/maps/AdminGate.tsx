"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchMe, isAdmin, logout, type SessionUser } from "@/lib/api";

type GateState =
  | { status: "loading" }
  | { status: "ok"; user: SessionUser }
  | { status: "denied"; user: SessionUser };

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<GateState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((user) => {
        if (cancelled) return;
        if (!user) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        setState(isAdmin(user.role) ? { status: "ok", user } : { status: "denied", user });
      })
      .catch(() => {
        if (!cancelled) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (state.status === "loading") {
    return <div className="main-map main-map--loading">Checking access…</div>;
  }

  if (state.status === "denied") {
    return (
      <div className="main-map main-map--loading">
        <div>
          <strong>Administrators only</strong>
          <p>
            {state.user.email} can sign in, but the Jashore map is limited to administrators.
          </p>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return children;
}
