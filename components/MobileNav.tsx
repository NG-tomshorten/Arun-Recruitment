"use client";

import { useEffect, useId, useRef, useState } from "react";
import { NavLink } from "./NavLink";
import { NAV_LINKS } from "./nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  // Escape and a tap outside both close the menu (taste pass, 6 Sep 2026).
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="-mr-2 flex h-11 w-11 items-center justify-center rounded-btn text-channel transition-colors duration-150 ease-out hover:bg-foam active:bg-foam"
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
          className="panel-in absolute inset-x-0 top-full z-40 border-b border-gull bg-chalk px-4 pb-3 pt-1 shadow-haze"
        >
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-t border-gull/50">
                <NavLink
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="-mx-2 flex items-center rounded-btn px-2 py-3 text-channel transition-colors duration-150 ease-out hover:bg-foam"
                  currentClassName="font-medium text-harbour-deep"
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
