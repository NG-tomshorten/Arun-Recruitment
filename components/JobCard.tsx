import Link from "next/link";
import { EMPLOYER_TYPE_LABELS, type JobCardData } from "@/lib/format";

/**
 * Placement card (PLAN §6, §11.4 — amended 2 Sep 2026: a record of a role
 * we filled, not a live vacancy). Reworked as a record in the showcase pass
 * of 6 Sep 2026: the "Filled" stamp sits beside the kicker, the location is
 * the heading with the role beneath, and the salary and what came with it
 * are a short labelled fact list rather than a headline number — the shape
 * of a case record, not a listing. The month closes the card. Rendered
 * inside the /jobs index (a client component) and under "More placements"
 * on every placement page.
 */
export function JobCard({
  job,
  // h3 fits under a section heading ("More placements"); the /jobs index
  // has no intermediate heading, so it passes h2 to keep heading order valid.
  headingLevel: Heading = "h3",
}: {
  job: JobCardData;
  headingLevel?: "h2" | "h3";
}) {
  const cityList =
    job.cities.length > 2
      ? `${job.cities.slice(0, 2).join(" · ")} +${job.cities.length - 2}`
      : job.cities.join(" · ");
  // "Throughout Taiwan" already names the country — don't append it again.
  const location = cityList.includes(job.country)
    ? cityList
    : `${cityList}, ${job.country}`;
  const meta = [EMPLOYER_TYPE_LABELS[job.employerType] ?? job.employerType]
    .concat(job.studentAges ? [job.studentAges] : [])
    .join(" · ");

  return (
    <article className="card group relative flex w-full flex-col p-6 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-harbour">
      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="kicker pt-0.5">{meta}</p>
          <span className="stamp shrink-0">Filled</span>
        </div>
        <Heading className="mt-2 text-h3">
          {/* The whole card is clickable via the stretched overlay below;
              the heading link is what screen readers and keyboards see. */}
          <Link
            href={`/jobs/${job.slug}`}
            className="after:absolute after:inset-0 after:rounded-card"
          >
            {location}
          </Link>
        </Heading>
        <p className="mt-1.5 text-fine text-flint">{job.title}</p>
      </div>

      {/* The record: labelled facts, salary in tabular figures with the
          approx-£ beneath, then what the employer included. */}
      <dl className="mt-5 grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-3 border-t border-gull/50 pt-5 text-fine">
        {job.salaryText && (
          <>
            <dt className="fact-label pt-0.5">Salary</dt>
            <dd>
              <p className="tnum font-semibold text-channel">
                {job.salaryText}{" "}
                <span className="whitespace-nowrap font-normal text-flint">
                  {job.salaryPeriod}
                </span>
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-flint">
                <span className="tnum">{job.approxGbp}</span>
                {job.afterTax && (
                  <span className="chip bg-brand-teal/45 text-[0.8125rem]">
                    after tax
                  </span>
                )}
              </p>
            </dd>
          </>
        )}
        {job.benefits.length > 0 && (
          <>
            <dt className="fact-label pt-0.5">Included</dt>
            <dd>
              <ul className="space-y-1 text-ink">
                {job.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
      </dl>

      {/* mt-auto pins the footer line so cards in a grid row align; pt-5
          keeps a minimum gap when this card is the tallest. */}
      <div className="mt-auto pt-5">
        <p className="flex items-center justify-between gap-3 border-t border-gull/50 pt-4 text-[0.8125rem] text-flint">
          <span>{job.postedLabel}</span>
          <span className="font-medium text-harbour-deep transition-colors duration-150 ease-out group-hover:text-harbour">
            See the placement
          </span>
        </p>
      </div>
    </article>
  );
}
