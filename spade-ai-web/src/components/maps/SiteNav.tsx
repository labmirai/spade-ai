"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteNav() {
  const path = usePathname();

  return (
    <nav className="site-nav">
      <Link href="/maps/jessore" className={path === "/maps/jessore" ? "is-on" : undefined}>
        Survey map
      </Link>
      <Link
        href="/maps/jessore/plan"
        className={path === "/maps/jessore/plan" ? "is-on" : undefined}
      >
        Collection plan
      </Link>
      <Link href="/profile">Profile</Link>
    </nav>
  );
}
