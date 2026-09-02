import type { Job } from "@/tina/__generated__/types";

/**
 * Client-safe display formatting shared by the jobs index (a client
 * component) and the server-rendered pages. Type-only imports from Tina's
 * generated types (PLAN §5 — no hand-written parallel Job type); nothing
 * here may import the Tina client or Node APIs.
 */

export type JobSalary = NonNullable<Job["salary"]>;

/**
 * The serialisable projection of a placement that crosses the server →
 * client boundary for the /jobs index (PLAN §6 as amended 2 Sep 2026: the
 * page is a record of filled placements, not a job board). Display strings
 * are precomputed server-side: card leads with location, then salary with
 * approx-GBP and an after-tax pill, then the two strongest benefits.
 */
export type JobCardData = {
  slug: string;
  title: string;
  country: string;
  cities: string[];
  employerType: string;
  studentAges: string | null;
  salaryText: string | null; // "RMB 20,000–25,000"
  salaryPeriod: string | null; // "per month"
  approxGbp: string | null; // "approx. £2,150–£2,690"
  afterTax: boolean;
  benefits: string[]; // the first two — Barry orders them strongest-first
  postedLabel: string; // "August 2026" — month + year only: the stored
  // dates are the old listing dates, close to but not exactly when each
  // placement was made, so cards commit to no more than the month.
  postedDate: string; // raw ISO, drives the newest-first sort
  salarySortKey: number; // approx GBP/month, ordering only
};

/* Labels — mirror the option lists in tina/config.ts. */

export const EMPLOYER_TYPE_LABELS: Record<string, string> = {
  kindergarten: "Kindergarten",
  primary: "Primary school",
  university: "University",
  "language-school": "Language school",
};

export const DEGREE_LABELS: Record<string, string> = {
  bachelors: "Bachelor's degree",
  "bachelors-or-above": "Bachelor's degree or above",
  "bachelors-or-associate": "Bachelor's degree or US Associate degree",
  masters: "Master's degree",
  none: "No degree required",
};

const number = new Intl.NumberFormat("en-GB");

/** "RMB 20,000–25,000" / "TWD 650–800". Wrap in `tnum` when displayed. */
export function formatSalaryRange(salary: JobSalary): string {
  const lo = number.format(salary.min);
  if (salary.max == null || salary.max === salary.min)
    return `${salary.currency} ${lo}`;
  return `${salary.currency} ${lo}–${number.format(salary.max)}`;
}

export function periodLabel(period: string): string {
  return period === "hour" ? "per hour" : "per month";
}

/**
 * "1 August 2026" from either "2026-08-01" or a full ISO timestamp — always
 * through Date, never by slicing the string (tina/config.ts, CHECKPOINT B
 * NOTE 2: the admin's date picker writes full ISO timestamps).
 */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** "August 2026" — the precision placements are dated to (see JobCardData). */
export function formatMonthYear(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/**
 * URL-param value for a filter option ("Xi'an" → "xian", "Language school"
 * → "language-school"). Mirrors the slugify in tina/config.ts so shareable
 * filter URLs (PLAN §6, `?country=taiwan`) stay readable.
 */
export function filterParam(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
