"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { NAV_LINKS } from "./nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-11 items-center justify-center rounded-btn text-channel"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          {open ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 8h16M4 16h16"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
      {open && (
        <nav
          id={panelId}
          aria-label="Site"
          className="absolute inset-x-0 top-full z-40 border-b border-gull bg-chalk px-4 pb-4 shadow-haze"
        >
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-t border-gull/50">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-channel"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
