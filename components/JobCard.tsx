import Link from "next/link";
import { EMPLOYER_TYPE_LABELS, type JobCardData } from "@/lib/format";

/**
 * Placement card (PLAN §6, §11.4 — amended 2 Sep 2026: a record of a role
 * we filled, not a live vacancy): location first, salary large in tabular
 * figures with approx-£ beneath, "after tax" pill where true, the two
 * strongest benefits, and the month of the placement. Rendered inside the
 * /jobs index (a client component) and on the server-rendered home page.
 */
export function JobCard({ job }: { job: JobCardData }) {
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
    <article className="relative flex w-full flex-col rounded-card border border-gull bg-chalk p-6 shadow-haze transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-harbour">
      <div>
        <h3 className="text-h3">
          {/* The whole card is clickable via the stretched overlay below;
              the heading link is what screen readers and keyboards see. */}
          <Link
            href={`/jobs/${job.slug}`}
            className="after:absolute after:inset-0 after:rounded-card"
          >
            {location}
          </Link>
        </h3>
        <p className="mt-1 text-fine text-flint">{meta}</p>
      </div>

      {job.salaryText && (
        <>
          <p className="tnum mt-5 text-[1.55rem] font-semibold leading-tight text-channel">
            {job.salaryText}
            <span className="text-fine font-normal text-flint">
              {" "}
              / {job.salaryPeriod === "per hour" ? "hour" : "month"}
            </span>
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-fine text-flint">
            <span className="tnum">{job.approxGbp}</span>
            {job.afterTax && (
              <span className="rounded-full bg-brand-teal/45 px-2.5 py-0.5 text-[0.8125rem] font-medium text-channel">
                after tax
              </span>
            )}
          </p>
        </>
      )}

      {job.benefits.length > 0 && (
        <ul className="mt-5 space-y-1.5 text-fine text-ink">
          {job.benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      )}

      {/* mt-auto pins the footer line so cards in a grid row align; pt-5
          keeps a minimum gap when this card is the tallest. */}
      <div className="mt-auto pt-5">
        <p className="border-t border-gull/50 pt-4 text-[0.8125rem] text-flint">
          <span className="sr-only">{job.title} — </span>
          {job.postedLabel}
        </p>
      </div>
    </article>
  );
}
