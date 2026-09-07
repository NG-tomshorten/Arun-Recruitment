import { client } from "@/tina/__generated__/client";
import type { Job } from "@/tina/__generated__/types";
import { approxGBPRange, type SalaryCurrency } from "@/lib/rates";
import {
  formatMonthYear,
  formatSalaryRange,
  periodLabel,
  type JobCardData,
} from "@/lib/format";

/**
 * Server-side placement data access (PLAN §5, §6 — amended 2 Sep 2026: the
 * listings are a record of placements we have made, not open vacancies, so
 * there is no apply flow and no JobPosting JSON-LD; structured job-posting
 * markup on filled roles would misrepresent them to Google).
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

export async function fetchShownJobs(): Promise<JobWithSlug[]> {
  // The `active` toggle hides a placement from the index and home page
  // (CLAUDE.md guardrail 10) — its page stays live at the same URL but
  // leaves the search index (noindex).
  return (await fetchAllJobs()).filter((job) => job.active !== false);
}

export async function fetchJob(slug: string): Promise<JobWithSlug> {
  const result = await client.queries.job({ relativePath: `${slug}.mdx` });
  return { ...(result.data.job as Job), slug };
}

/** Project a placement into the serialisable card shape the index needs. */
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
    postedLabel: formatMonthYear(job.postedDate),
    postedDate: job.postedDate,
  };
}

/* ── Rich-text serialisation (meta descriptions only) ───────────────────── */

type RichTextNode = {
  type?: string;
  text?: string;
  children?: RichTextNode[];
};

function nodeText(node: RichTextNode): string {
  if (node.text != null) return node.text;
  // List items run together without a separator otherwise ("…developmentBachelor's…")
  const joiner = node.type === "ul" || node.type === "ol" ? "; " : "";
  return (node.children ?? []).map(nodeText).join(joiner);
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
