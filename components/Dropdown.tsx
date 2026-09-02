"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Custom dropdown for the /profile wizard (PLAN amendment 2 Sep 2026
 * (profile)) — a button + listbox in the site's form styling, because the
 * native <select> can't do multi-select without the dire <select multiple>
 * UI and can't be styled to match. Single mode picks one value and closes;
 * multiple mode toggles values and stays open.
 *
 * Accessibility follows the WAI-ARIA listbox pattern: the trigger carries
 * aria-haspopup/aria-expanded, options are role="option" with roving focus
 * (arrow keys, Home/End, Enter/Space to choose, Escape to close). Callers
 * label it with an ordinary <label htmlFor={id}> on the trigger.
 *
 * State lives with the caller — pass `values` (empty, one, or many) and an
 * `onChange` that receives the full new selection.
 */
export function Dropdown({
  id,
  placeholder,
  options,
  values,
  onChange,
  multiple = false,
  invalid = false,
}: {
  id: string;
  placeholder: string;
  options: readonly (readonly [string, string])[];
  values: readonly string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const listId = useId();

  // Close when anything outside is pressed.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // On open, move focus into the list — to the first chosen option, or the
  // first option when nothing is chosen yet.
  useEffect(() => {
    if (!open) return;
    const first = options.findIndex(([value]) => values.includes(value));
    optionRefs.current[first >= 0 ? first : 0]?.focus();
  }, [open, options, values]);

  function choose(value: string) {
    if (multiple) {
      onChange(
        values.includes(value)
          ? values.filter((v) => v !== value)
          : [...values, value],
      );
    } else {
      onChange([value]);
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  function onListKeyDown(event: React.KeyboardEvent) {
    const focused = optionRefs.current.findIndex(
      (el) => el === document.activeElement,
    );
    const last = options.length - 1;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next =
        event.key === "ArrowDown"
          ? Math.min(focused + 1, last)
          : Math.max(focused - 1, 0);
      optionRefs.current[next]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      optionRefs.current[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      optionRefs.current[last]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (focused >= 0) choose(options[focused][0]);
    }
  }

  const summary = options
    .filter(([value]) => values.includes(value))
    .map(([, label]) => label)
    .join(", ");

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={`mt-1.5 flex w-full items-center justify-between gap-3 rounded-btn border-[1.5px] bg-white px-3.5 py-2.5 text-left transition-colors duration-150 ease-out hover:border-harbour ${
          invalid ? "border-rust" : "border-gull"
        }`}
      >
        <span className={summary ? "text-ink" : "text-flint"}>
          {summary || placeholder}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          className={`h-2 w-3 shrink-0 fill-none stroke-flint stroke-2 transition-transform duration-150 ease-out ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M1 1.5 6 6.5 11 1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={id}
          aria-multiselectable={multiple || undefined}
          onKeyDown={onListKeyDown}
          className="step-in absolute z-10 mt-1.5 max-h-72 w-full overflow-y-auto rounded-btn border-[1.5px] border-gull bg-white py-1 shadow-haze"
        >
          {options.map(([value, label], index) => {
            const selected = values.includes(value);
            return (
              <li
                key={value}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                role="option"
                aria-selected={selected}
                tabIndex={-1}
                onClick={() => choose(value)}
                className={`flex cursor-pointer items-center gap-2.5 px-3.5 py-2 transition-colors duration-150 ease-out hover:bg-foam focus:bg-foam ${
                  selected ? "font-medium text-harbour-deep" : "text-ink"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-4 shrink-0 items-center justify-center border-[1.5px] ${
                    multiple ? "rounded-sm" : "rounded-full"
                  } ${selected ? "border-harbour bg-harbour" : "border-gull bg-white"}`}
                >
                  {selected && (
                    <svg
                      viewBox="0 0 10 8"
                      className="h-2 w-2.5 fill-none stroke-chalk stroke-2"
                    >
                      <path d="M1 4 3.8 6.8 9 1.2" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
