"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/api";

export default function SiteNav() {
  const path = usePathname();
  const router = useRouter();

  return (
    <nav className="site-nav">
      <Link href="/">SPADE-AI</Link>
      <Link href="/admin/users" className={path === "/admin/users" ? "is-on" : undefined}>
        Accounts
      </Link>
      <Link href="/maps/jessore" className={path === "/maps/jessore" ? "is-on" : undefined}>
        Survey map
      </Link>
      <Link
        href="/maps/jessore/plan"
        className={path === "/maps/jessore/plan" ? "is-on" : undefined}
      >
        Collection plan
      </Link>
      <button
        type="button"
        onClick={() => {
          logout();
          router.replace("/login");
        }}
      >
        Sign out
      </button>
    </nav>
  );
}
