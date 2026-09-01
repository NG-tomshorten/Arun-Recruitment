import { client } from "@/tina/__generated__/client";
import type { Job } from "@/tina/__generated__/types";
import { approxGBP, approxGBPRange, type SalaryCurrency } from "@/lib/rates";
import {
  formatDate,
  formatSalaryRange,
  periodLabel,
  type JobCardData,
} from "@/lib/format";
import { SITE_URL } from "@/lib/site";

/**
 * Server-side job data access + JSON-LD (PLAN §5, §6, §9).
 *
 * Everything consumes the types Tina generates — no hand-written Job type
 * (PLAN §5). Queries run against the local GraphQL server that `tinacms dev`
 * (development) or `tinacms build --local -c "next build"` (production
 * build) keeps alive; nothing here executes at request time — the site is
 * static. Client-safe formatting lives in lib/format.ts.
 */

export { SITE_URL, APPLY_EMAIL } from "@/lib/site";

/** The filename is the slug is the URL (PLAN §5). */
export type JobWithSlug = Job & { slug: string };

export async function fetchAllJobs(): Promise<JobWithSlug[]> {
  const result = await client.queries.jobConnection({ first: 500 });
  const jobs =
    result.data.jobConnection.edges?.flatMap((edge) =>
      edge?.node
        ? [{ ...(edge.node as Job), slug: edge.node._sys.filename }]
        : [],
    ) ?? [];
  // Newest first — the index default and the order no-JS visitors see.
  return jobs.sort(
    (a, b) => Date.parse(b.postedDate) - Date.parse(a.postedDate),
  );
}

export async function fetchActiveJobs(): Promise<JobWithSlug[]> {
  // `active` retires a listing (CLAUDE.md guardrail 10) — inactive jobs keep
  // their page (filled state) but leave the index, home page and JSON-LD.
  return (await fetchAllJobs()).filter((job) => job.active !== false);
}

export async function fetchJob(slug: string): Promise<JobWithSlug> {
  const result = await client.queries.job({ relativePath: `${slug}.mdx` });
  return { ...(result.data.job as Job), slug };
}

/** Posted within the last 28 days — drives the beak "New" badge. */
function isNew(postedDate: string): boolean {
  return Date.now() - Date.parse(postedDate) < 28 * 24 * 60 * 60 * 1000;
}

/**
 * Sort key for "highest salary": approx GBP per month. Hourly rates are
 * scaled by a nominal 100 teaching hours/month — a deliberately rough
 * ordering heuristic, used only to sort and never displayed.
 */
function monthlyGBPSortKey(salary: Job["salary"]): number {
  if (!salary) return 0;
  const monthly = salary.period === "hour" ? salary.min * 100 : salary.min;
  return approxGBP(monthly, salary.currency as SalaryCurrency);
}

/** Project a job into the serialisable card shape the /jobs index needs. */
export function toCardData(job: JobWithSlug): JobCardData {
  const salary = job.salary ?? null;
  return {
    slug: job.slug,
    title: job.title,
    country: job.country,
    cities: job.cities,
    employerType: job.employerType,
    studentAges: job.studentAges ?? null,
    salaryText: salary ? formatSalaryRange(salary) : null,
    salaryPeriod: salary ? periodLabel(salary.period) : null,
    approxGbp: salary
      ? approxGBPRange(
          salary.min,
          salary.max ?? undefined,
          salary.currency as SalaryCurrency,
        )
      : null,
    afterTax: salary?.afterTax === true,
    benefits: (job.benefits ?? []).filter((b): b is string => !!b).slice(0, 2),
    postedLabel: formatDate(job.postedDate),
    postedDate: job.postedDate,
    isNew: isNew(job.postedDate),
    teflRequired: job.requirements?.tefl === true,
    salarySortKey: monthlyGBPSortKey(job.salary),
  };
}

/* ── Rich-text serialisation (JSON-LD + meta descriptions only) ─────────── */

type RichTextNode = {
  type?: string;
  text?: string;
  children?: RichTextNode[];
};

function nodeText(node: RichTextNode): string {
  if (node.text != null) return node.text;
  return (node.children ?? []).map(nodeText).join("");
}

/** Flatten the Tina rich-text AST to plain text (meta descriptions). */
export function richTextToPlainText(body: unknown): string {
  const root = body as RichTextNode | null;
  if (!root?.children) return "";
  return root.children
    .map((n) => nodeText(n).trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
}

/**
 * Plain-ish HTML for the JSON-LD `description` (PLAN §9) — paragraphs and
 * lists only. This string lives inside a JSON script tag; the page body
 * itself renders through Tina's <TinaMarkdown> (CLAUDE.md guardrail 5).
 */
export function richTextToSimpleHTML(body: unknown): string {
  const root = body as RichTextNode | null;
  if (!root?.children) return "";
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const block = (node: RichTextNode): string => {
    switch (node.type) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6": {
        const text = escape(nodeText(node).trim());
        return text ? `<p><strong>${text}</strong></p>` : "";
      }
      case "ul":
      case "ol": {
        const items = (node.children ?? [])
          .map((li) => escape(nodeText(li).trim()))
          .filter(Boolean)
          .map((text) => `<li>${text}</li>`)
          .join("");
        return items ? `<ul>${items}</ul>` : "";
      }
      default: {
        const text = escape(nodeText(node).trim());
        return text ? `<p>${text}</p>` : "";
      }
    }
  };
  return root.children.map(block).filter(Boolean).join("");
}

/* ── JobPosting JSON-LD (PLAN §9 — the highest-value item) ──────────────── */

/** ISO 4217 for JSON-LD (PLAN §5): display RMB → CNY; TWD stays TWD. */
const ISO_CURRENCY: Record<SalaryCurrency, string> = {
  RMB: "CNY",
  TWD: "TWD",
};

export function buildJobPostingJsonLd(job: JobWithSlug): object {
  const salary = job.salary;
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: richTextToSimpleHTML(job.body) || `<p>${job.title}</p>`,
    datePosted: new Date(job.postedDate).toISOString().slice(0, 10),
    // validThrough ONLY from an explicit closing date (PLAN §9, §14.7) —
    // these are evergreen listings; a derived expiry would silently drop
    // still-open roles from Google's index.
    ...(job.closingDate
      ? { validThrough: new Date(job.closingDate).toISOString().slice(0, 10) }
      : {}),
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "Arun Language Training & Recruitment Ltd",
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo-square.png`,
    },
    jobLocation: job.cities.map((city) => ({
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        addressCountry: job.country === "Taiwan" ? "TW" : "CN",
      },
    })),
    ...(salary
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: ISO_CURRENCY[salary.currency as SalaryCurrency],
            value: {
              "@type": "QuantitativeValue",
              minValue: salary.min,
              ...(salary.max != null ? { maxValue: salary.max } : {}),
              unitText: salary.period === "hour" ? "HOUR" : "MONTH",
            },
          },
        }
      : {}),
    directApply: false,
    url: `${SITE_URL}/jobs/${job.slug}`,
  };
}
