"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * A site-nav link that knows whether it is the current page (PLAN §11.4
 * accessibility bar — taste pass, 6 Sep 2026). Sets aria-current="page" on
 * the section it belongs to, including subpages (/jobs/… under /jobs), and
 * styles from that attribute so the marker and the semantics can't drift.
 */
export function NavLink({
  href,
  className,
  currentClassName,
  onClick,
  children,
}: {
  href: string;
  className: string;
  currentClassName: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={current ? "page" : undefined}
      className={`${className} ${current ? currentClassName : ""}`}
    >
      {children}
    </Link>
  );
}
