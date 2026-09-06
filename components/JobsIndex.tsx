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
 * placements we have made, not a job board): card grid filtered client-side
 * by country, city and employer type; sortable by salary or newest. Filter
 * state syncs to URL params (?country=taiwan) so filtered views are
 * shareable.
 *
 * Progressive enhancement: the full, newest-first list is server-rendered;
 * the filter controls stay `hidden` until hydration reveals them, so with
 * JS disabled the complete list renders and no dead controls appear. URL
 * params are read after mount for the same reason — useSearchParams would
 * push the whole list out of the static HTML behind a Suspense fallback.
 */

type Filters = {
  country: string;
  city: string;
  type: string;
  sort: string;
};

const NO_FILTERS: Filters = {
  country: "",
  city: "",
  type: "",
  sort: "newest",
};

function readFilters(search: string): Filters {
  const params = new URLSearchParams(search);
  return {
    country: params.get("country") ?? "",
    city: params.get("city") ?? "",
    type: params.get("type") ?? "",
    sort: params.get("sort") === "salary" ? "salary" : "newest",
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
  if (filters.city) params.set("city", filters.city);
  if (filters.type) params.set("type", filters.type);
  if (filters.sort !== "newest") params.set("sort", filters.sort);
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
 * One filter control: label over a styled native select (the `field` recipe
 * with the browser chrome stripped and our own chevron — taste pass,
 * 6 Sep 2026). Two per row on phones, inline from sm.
 */
function Filter({
  label,
  value,
  onChange,
  className,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex flex-col text-fine font-medium text-flint ${
        className ?? ""
      }`}
    >
      {label}
      <span className="relative mt-1.5 block">
        <select
          className="field appearance-none py-2 pr-9 text-fine sm:w-auto sm:min-w-36"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {children}
        </select>
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-flint"
        >
          <path
            d="M4 6l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </label>
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

  const cities = useMemo(
    () =>
      [...new Set(jobs.flatMap((job) => job.cities))].sort((a, b) =>
        a.localeCompare(b, "en-GB")
      ),
    [jobs]
  );

  const visible = useMemo(() => {
    const matches = jobs.filter(
      (job) =>
        (!filters.country || filterParam(job.country) === filters.country) &&
        (!filters.city ||
          job.cities.some((city) => filterParam(city) === filters.city)) &&
        (!filters.type || job.employerType === filters.type)
    );
    if (filters.sort === "salary")
      return [...matches].sort((a, b) => b.salarySortKey - a.salarySortKey);
    return matches; // server order is already newest first
  }, [jobs, filters]);

  const active = filters.country || filters.city || filters.type;

  return (
    <>
      {/* hidden until hydration — no dead controls without JS */}
      <form
        hidden={!mounted}
        aria-label="Filter and sort the placements"
        className="mt-10 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end"
        onSubmit={(event) => event.preventDefault()}
      >
        <Filter
          label="Country"
          value={filters.country}
          onChange={(value) => set({ country: value })}
        >
          <option value="">All</option>
          <option value="taiwan">Taiwan</option>
          <option value="china">China</option>
        </Filter>
        <Filter
          label="City"
          value={filters.city}
          onChange={(value) => set({ city: value })}
        >
          <option value="">All</option>
          {cities.map((city) => (
            <option key={city} value={filterParam(city)}>
              {city}
            </option>
          ))}
        </Filter>
        <Filter
          label="Type of school"
          value={filters.type}
          onChange={(value) => set({ type: value })}
        >
          <option value="">All</option>
          {Object.entries(EMPLOYER_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Filter>
        <Filter
          label="Sort by"
          value={filters.sort}
          onChange={(value) => set({ sort: value })}
          className="sm:ml-auto"
        >
          <option value="newest">Newest</option>
          <option value="salary">Highest salary</option>
        </Filter>
      </form>

      {/* Results count announced to screen readers on every filter change */}
      <p aria-live="polite" className="mt-6 text-fine text-flint">
        {visible.length === 1
          ? `1 placement${active ? " matches your filters" : ""}`
          : `${visible.length} placements${
              active ? " match your filters" : ""
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
            Clear the filters to see the full list, or{" "}
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
            onClick={() => set({ ...NO_FILTERS, sort: filters.sort })}
            className="mt-5 inline-flex items-center rounded-btn border-[1.5px] border-harbour px-4 py-2 text-fine font-medium text-harbour-deep transition-[color,background-color,transform] duration-150 ease-out hover:bg-chalk active:translate-y-px"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
