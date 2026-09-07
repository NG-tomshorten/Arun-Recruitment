"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

/**
 * The seven-service menu on /for-employers (PLAN §6: "a clean grid with
 * one-line descriptions"). Compact pass, 7 Sep 2026: the services sit in
 * one row, and the description of the one under the pointer
 * shows beneath the row instead of every description stacking down the
 * page.
 *
 * Built as tabs with automatic activation (WAI-ARIA APG) so the hover
 * reveal is not hover-only: hovering, focusing, tapping or arrowing onto a
 * service all select it, and the panel beneath is the one live region. All
 * seven descriptions stay in the DOM (inactive ones `hidden`) so aria-controls
 * always resolves. Motion is the 180ms `step-in` fade on the panel — CSS
 * only, stilled by the reduced-motion block in globals.css.
 *
 * Below lg the row wraps into a grid of cells; the panel stays beneath.
 */

export type Service = { name: string; description: string };

const tabCls =
  "group flex min-w-0 border-b-2 px-1 pb-3 pt-1 text-left transition-[color,border-color] duration-150 ease-out";

export function ServiceMenu({ services }: { services: Service[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const idBase = useId();

  const focusTab = (index: number) => {
    const next = (index + services.length) % services.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusTab(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusTab(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(services.length - 1);
        break;
    }
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Our services"
        className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:grid-cols-7"
      >
        {services.map((service, index) => {
          const selected = index === active;
          return (
            <button
              key={service.name}
              type="button"
              role="tab"
              id={`${idBase}-tab-${index}`}
              aria-selected={selected}
              aria-controls={`${idBase}-panel-${index}`}
              tabIndex={selected ? 0 : -1}
              ref={(el) => {
                tabs.current[index] = el;
              }}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`${tabCls} ${
                selected ? "border-harbour" : "border-gull/60 hover:border-flint"
              }`}
            >
              <span
                className={`font-display text-lg font-semibold leading-snug transition-colors duration-150 ease-out ${
                  selected ? "text-channel" : "text-flint group-hover:text-channel"
                }`}
              >
                {service.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reserved height for two lines of body text, so the row and the CTA
          beneath never shift as the description changes */}
      <div className="mt-5 min-h-[calc(2*var(--text-body--line-height)*var(--text-body))]">
        {services.map((service, index) => (
          <p
            key={service.name}
            role="tabpanel"
            id={`${idBase}-panel-${index}`}
            aria-labelledby={`${idBase}-tab-${index}`}
            tabIndex={0}
            hidden={index !== active}
            className="step-in max-w-[52ch] text-ink"
          >
            {service.description}
          </p>
        ))}
      </div>
    </div>
  );
}
