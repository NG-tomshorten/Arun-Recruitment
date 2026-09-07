"use client";

import { useMemo, useSyncExternalStore } from "react";
import { JobCard } from "@/components/JobCard";
import {
  EMPLOYER_TYPE_LABELS,
  filterParam,
  type JobCardData,
} from "@/lib/format";
import { APPLY_EMAIL } from "@/lib/site";

/**
 * The /jobs index body (PLAN §6 — amended 2 Sep 2026: a showcase of the
 * placements we have made, not a job board). Showcase pass, 6 Sep 2026: the
 * select-and-sort bar went — a search form is what makes a page read as a
 * job board — and browsing is by chip (the filter chips of PLAN §11.4 and
 * /styleguide): country, then type of school. No salary sort, no city
 * select; the decision is in docs/DECISIONS.md. Chip state still syncs to
 * URL params (?country=taiwan) so a filtered view is shareable.
 *
 * Progressive enhancement: the full, newest-first list is server-rendered;
 * the chips stay `hidden` until hydration reveals them, so with JS disabled
 * the complete list renders and no dead controls appear. URL params are
 * read after mount for the same reason — useSearchParams would push the
 * whole list out of the static HTML behind a Suspense fallback.
 */

type Filters = {
  country: string;
  type: string;
};

const NO_FILTERS: Filters = { country: "", type: "" };

const COUNTRIES = [
  { value: "taiwan", label: "Taiwan" },
  { value: "china", label: "China" },
];

function readFilters(search: string): Filters {
  const params = new URLSearchParams(search);
  return {
    country: params.get("country") ?? "",
    type: params.get("type") ?? "",
  };
}

/**
 * The URL query string as an external store (useSyncExternalStore): the
 * server snapshot is "" so the static HTML always carries the full,
 * unfiltered list; after hydration the real query applies and our own
 * writes notify subscribers (replaceState fires no event of its own).
 */
const listeners = new Set<() => void>();

function subscribeToSearch(callback: () => void) {
  window.addEventListener("popstate", callback);
  listeners.add(callback);
  return () => {
    window.removeEventListener("popstate", callback);
    listeners.delete(callback);
  };
}

function writeFilters(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.country) params.set("country", filters.country);
  if (filters.type) params.set("type", filters.type);
  const query = params.toString();
  // replaceState, not the router — filtering is a view of this page, not a
  // navigation, and it must not scroll or add history entries.
  window.history.replaceState(
    null,
    "",
    query ? `?${query}` : location.pathname
  );
  listeners.forEach((callback) => callback());
}

/**
 * One row of filter chips (PLAN §11.4): a label, "All", then one chip per
 * option. Toggle buttons with aria-pressed — foam/channel idle, the pressed
 * chip inverts to channel/chalk.
 */
function ChipRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const chip =
    "rounded-full px-3.5 py-1.5 text-fine font-medium leading-snug transition-[color,background-color,transform] duration-150 ease-out active:translate-y-px";
  const idle = "bg-foam text-channel hover:bg-gull/60";
  const pressed = "bg-channel text-chalk";
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-2"
    >
      <span className="mr-1 text-fine font-medium text-flint">{label}</span>
      {[{ value: "", label: "All" }, ...options].map((option) => {
        const isPressed = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isPressed}
            onClick={() => onChange(option.value)}
            className={`${chip} ${isPressed ? pressed : idle}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function JobsIndex({ jobs }: { jobs: JobCardData[] }) {
  const search = useSyncExternalStore(
    subscribeToSearch,
    () => window.location.search,
    () => "" // server snapshot: the static HTML shows the full list
  );
  const mounted = useSyncExternalStore(
    subscribeToSearch,
    () => true,
    () => false
  );
  const filters = useMemo(() => readFilters(search), [search]);

  const set = (patch: Partial<Filters>) => {
    writeFilters({ ...filters, ...patch });
  };

  // Only offer the school types that appear in the record.
  const types = useMemo(
    () =>
      Object.entries(EMPLOYER_TYPE_LABELS)
        .filter(([value]) => jobs.some((job) => job.employerType === value))
        .map(([value, label]) => ({ value, label })),
    [jobs]
  );

  const visible = useMemo(
    () =>
      jobs.filter(
        (job) =>
          (!filters.country ||
            filterParam(job.country) === filters.country) &&
          (!filters.type || job.employerType === filters.type)
      ),
    [jobs, filters]
  );

  const active = filters.country || filters.type;

  return (
    <>
      {/* hidden until hydration — no dead controls without JS */}
      <div
        hidden={!mounted}
        role="group"
        aria-label="Browse the placements"
        className="mt-10 flex flex-col gap-3 border-y border-gull/50 py-5 sm:flex-row sm:flex-wrap sm:gap-x-10"
      >
        <ChipRow
          label="Country"
          value={filters.country}
          options={COUNTRIES}
          onChange={(value) => set({ country: value })}
        />
        <ChipRow
          label="School"
          value={filters.type}
          options={types}
          onChange={(value) => set({ type: value })}
        />
      </div>

      {/* Results count announced to screen readers on every filter change */}
      <p aria-live="polite" className="mt-6 text-fine text-flint">
        {visible.length === 1
          ? `1 placement${active ? " matches your selection" : ""}`
          : `${visible.length} placements${
              active ? " match your selection" : ""
            }`}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-6 grid list-none grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((job) => (
            <li key={job.slug} className="flex">
              <JobCard job={job} headingLevel="h2" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card-callout mt-10 max-w-[52ch] p-8">
          <h2 className="text-h3">No placements match</h2>
          <p className="mt-3 text-flint">
            Show the full list, or{" "}
            <a
              href={`mailto:${APPLY_EMAIL}`}
              className="text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
            >
              email us
            </a>{" "}
            about the kind of role you are looking for.
          </p>
          <button
            type="button"
            onClick={() => set(NO_FILTERS)}
            className="mt-5 inline-flex items-center rounded-btn border-[1.5px] border-harbour px-4 py-2 text-fine font-medium text-harbour-deep transition-[color,background-color,transform] duration-150 ease-out hover:bg-chalk active:translate-y-px"
          >
            Show all placements
          </button>
        </div>
      )}
    </>
  );
}
