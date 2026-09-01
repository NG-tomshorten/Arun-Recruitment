import type { Metadata } from "next";
import { JobsIndex } from "@/components/JobsIndex";
import { TideLine } from "@/components/TideLine";
import { fetchActiveJobs, toCardData } from "@/lib/jobs";
import { SITE_URL } from "@/lib/site";

/**
 * /jobs — the index (PLAN §6): card grid, client-side filters and sort with
 * shareable URL params, aria-live results count, useful empty state. Only
 * active listings appear; retired jobs keep their page but leave this list.
 */

export const metadata: Metadata = {
  title: "Teaching jobs in Taiwan and China",
  description:
    "Current English-teaching vacancies in Taiwan and mainland China: kindergartens, primary schools, universities and language schools, with full salary and benefits detail.",
  alternates: { canonical: `${SITE_URL}/jobs` },
};

export default async function JobsPage() {
  const jobs = (await fetchActiveJobs()).map(toCardData);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <p className="kicker">Teaching jobs</p>
      <h1 className="mt-4 text-h1">Teaching jobs in Taiwan and China</h1>
      <TideLine className="mt-4 max-w-40" />
      <p className="mt-6 max-w-[52ch] text-lead text-flint">
        Every listing shows the full salary and benefits as the employer gives
        them, with an approximate pound conversion. Apply by email with your
        CV.
      </p>

      <JobsIndex jobs={jobs} />
    </div>
  );
}
