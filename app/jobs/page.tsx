import type { Metadata } from "next";
import { JobsIndex } from "@/components/JobsIndex";
import { TideLine } from "@/components/TideLine";
import { fetchShownJobs, toCardData } from "@/lib/jobs";
import { APPLY_EMAIL, SITE_URL } from "@/lib/site";

/**
 * /jobs — the placements record (PLAN §6, amended 2 Sep 2026: the roles on
 * the old site were already filled, so this page is a showcase of the
 * placements we have made, not a job board). Card grid, client-side filters
 * and sort with shareable URL params, aria-live results count. Hidden
 * placements (active = false) keep their page but leave this list.
 */

export const metadata: Metadata = {
  title: "Teaching jobs we've filled in Taiwan and China",
  description:
    "A record of the English-teaching placements Arun Language Training & Recruitment has made in Taiwan and mainland China: kindergartens, primary schools, universities and language schools.",
  alternates: { canonical: `${SITE_URL}/jobs` },
};

export default async function JobsPage() {
  const jobs = (await fetchShownJobs()).map(toCardData);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <p className="kicker">Placements</p>
      <h1 className="mt-4 text-h1">Teaching jobs we&rsquo;ve filled</h1>
      <TideLine className="mt-4 max-w-40" />
      <p className="mt-6 max-w-[56ch] text-lead text-flint">
        A record of placements we have made in Taiwan and mainland China. Each
        one shows the salary and benefits as the employer gave them, with an
        approximate pound conversion.
      </p>
      <p className="mt-4 max-w-[56ch] text-flint">
        These positions have been filled. If you are looking for a role like
        one of them, email your CV to{" "}
        <a
          href={`mailto:${APPLY_EMAIL}`}
          className="select-all text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
        >
          {APPLY_EMAIL}
        </a>
        .
      </p>

      <JobsIndex jobs={jobs} />
    </div>
  );
}
