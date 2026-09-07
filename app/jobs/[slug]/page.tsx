import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { JobCard } from "@/components/JobCard";
import { TideLine } from "@/components/TideLine";
import {
  DEGREE_LABELS,
  EMPLOYER_TYPE_LABELS,
  formatMonthYear,
  formatSalaryRange,
  periodLabel,
} from "@/lib/format";
import {
  fetchAllJobs,
  fetchJob,
  fetchShownJobs,
  richTextToPlainText,
  toCardData,
  type JobWithSlug,
} from "@/lib/jobs";
import { approxGBPRange, type SalaryCurrency } from "@/lib/rates";
import { APPLY_EMAIL, SITE_URL } from "@/lib/site";

/**
 * /jobs/[slug] — one placement record (PLAN §6, amended 2 Sep 2026: these
 * are roles we have already filled, so there is no apply flow and no
 * JobPosting JSON-LD — structured job-posting markup on a filled role would
 * misrepresent it to Google). Showcase pass, 6 Sep 2026: laid out as a case
 * record rather than a listing — the "Filled" stamp beside the kicker, the
 * story (what the role asked for, what came with it, about the role) on the
 * left, a fact file in the rail with the salary as one labelled fact rather
 * than a headline number, then a single "roles like this" callout and three
 * more placements. The sticky rail with its button — the apply-panel shape —
 * is gone.
 */

// Every placement page is prerendered; the slug list is closed at build time.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await fetchAllJobs()).map((job) => ({ slug: job.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchJob(slug);
  const description = richTextToPlainText(job.body).slice(0, 155);
  return {
    title: `${job.title} (filled)`,
    description:
      description ||
      `${job.title} — a teaching placement we made in ${job.cities.join(
        ", "
      )}, ${job.country}.`,
    alternates: { canonical: `${SITE_URL}/jobs/${slug}` },
    // A hidden placement keeps its URL but leaves the search index (PLAN §5).
    ...(job.active === false ? { robots: { index: false } } : {}),
  };
}

/** One label/value row in a fact list; rows with no value vanish. */
function Fact({ label, value }: { label: string; value?: ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt className="fact-label">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}

/** Tina rich text → on-brand markup, via Tina's renderer (guardrail 5). */
function JobBody({ body }: { body: JobWithSlug["body"] }) {
  return (
    <TinaMarkdown
      content={body}
      components={{
        h1: (props) => <h2 className="mt-10 text-h3" {...props} />,
        h2: (props) => <h2 className="mt-10 text-h3" {...props} />,
        h3: (props) => <h3 className="mt-8 text-h3" {...props} />,
        p: (props) => <p className="mt-5 text-ink" {...props} />,
        ul: (props) => (
          <ul className="mt-5 list-disc space-y-1.5 pl-5 text-ink" {...props} />
        ),
        ol: (props) => (
          <ol
            className="mt-5 list-decimal space-y-1.5 pl-5 text-ink"
            {...props}
          />
        ),
        bold: (props) => <strong className="font-semibold" {...props} />,
      }}
    />
  );
}

/**
 * The one call to action on the page: this role is filled; we recruit for
 * ones like it. A full-width callout after the record, not a panel beside it.
 */
function SimilarRolesCallout({ title }: { title: string }) {
  const subject = encodeURIComponent(`Roles like: ${title}`);
  return (
    <section
      aria-labelledby="similar-roles"
      className="card-callout mt-16 p-8 lg:flex lg:items-center lg:justify-between lg:gap-12"
    >
      <div className="max-w-[56ch]">
        <h2 id="similar-roles" className="text-h3">
          Looking for a role like this one?
        </h2>
        <p className="mt-3 text-flint">
          This position has been filled, and the page stays here as a record
          of the placement. We recruit for similar roles — email us your CV,
          your nationality and your teaching qualifications, and we will be in
          touch when one comes up.
        </p>
      </div>
      <div className="mt-6 lg:mt-0 lg:shrink-0 lg:text-right">
        <a
          href={`mailto:${APPLY_EMAIL}?subject=${subject}`}
          className="inline-flex items-center justify-center rounded-btn border-[1.5px] border-harbour bg-harbour px-5 py-3 font-medium text-chalk shadow-lift transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out hover:border-harbour-deep hover:bg-harbour-deep active:translate-y-px active:shadow-none"
        >
          Email us your CV
        </a>
        <p className="mt-3 text-[0.8125rem] text-flint">
          Or write to <span className="select-all">{APPLY_EMAIL}</span>.
        </p>
      </div>
    </section>
  );
}

export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const job = await fetchJob(slug);
  const salary = job.salary;
  const requirements = job.requirements;
  const benefits = (job.benefits ?? []).filter((b): b is string => !!b);
  const passports = (requirements?.passports ?? []).filter(
    (p): p is string => !!p
  );
  // Three more from the record, newest first, so the page ends the way the
  // index begins — with the work — rather than on a button.
  const more = (await fetchShownJobs())
    .filter((other) => other.slug !== slug)
    .slice(0, 3)
    .map(toCardData);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-fine">
        <Link
          href="/jobs"
          className="text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
        >
          ← All placements
        </Link>
      </nav>

      <article className="mt-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="stamp">Filled</span>
          <p className="kicker">
            {job.country} ·{" "}
            {EMPLOYER_TYPE_LABELS[job.employerType] ?? job.employerType}
          </p>
        </div>
        <h1 className="mt-4 max-w-[24ch] text-h1">{job.title}</h1>
        <TideLine className="mt-4 max-w-40" />
        <p className="mt-5 text-flint">
          {job.cities.join(" · ")} · {formatMonthYear(job.postedDate)}
        </p>

        {/* The fact file comes first in the DOM so phones read facts, then
            the story; from lg the grid places it in the rail beside the
            story, sticky, and the story fills the first column. */}
        <div className="lg:grid lg:grid-cols-[1fr_20rem] lg:gap-12">
          <aside
            className="mt-10 lg:col-start-2 lg:row-start-1"
            aria-labelledby="fact-file"
          >
            <div className="card p-6 lg:sticky lg:top-8">
              <h2 id="fact-file" className="text-h3">
                The placement
              </h2>
              <dl className="mt-5 space-y-5">
                {salary && (
                  <Fact
                    label="Salary"
                    value={
                      <>
                        <span className="tnum font-semibold text-channel">
                          {formatSalaryRange(salary)}
                        </span>{" "}
                        <span className="whitespace-nowrap text-flint">
                          {periodLabel(salary.period)}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-fine text-flint">
                          <span className="tnum">
                            {approxGBPRange(
                              salary.min,
                              salary.max ?? undefined,
                              salary.currency as SalaryCurrency
                            )}
                          </span>
                          {salary.afterTax && (
                            <span className="chip bg-brand-teal/45 text-[0.8125rem]">
                              after tax
                            </span>
                          )}
                        </span>
                      </>
                    }
                  />
                )}
                <Fact label="Teaching hours" value={job.teachingHours} />
                <Fact label="Office hours" value={job.officeHours} />
                <Fact label="Working pattern" value={job.schedule} />
                <Fact label="Age of students" value={job.studentAges} />
                <Fact label="Class size" value={job.classSize} />
                <Fact
                  label="Positions"
                  value={job.vacancies != null ? String(job.vacancies) : null}
                />
                <Fact label="Start dates" value={job.startDates} />
                <Fact label="Visa support" value={job.visaSupport} />
              </dl>
            </div>
          </aside>

          <div className="lg:col-start-1 lg:row-start-1">
            {requirements && (
              <section className="mt-10">
                <h2 className="text-h3">What the role asked for</h2>
                <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  <Fact
                    label="Minimum qualification"
                    value={
                      DEGREE_LABELS[requirements.degree] ?? requirements.degree
                    }
                  />
                  <Fact
                    label="TEFL certificate"
                    value={requirements.tefl ? "Required" : "Not required"}
                  />
                  <Fact label="Experience" value={requirements.experience} />
                </dl>
                {passports.length > 0 && (
                  <div className="mt-6">
                    <h3 className="fact-label">Passports accepted</h3>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {passports.map((passport) => (
                        <li key={passport} className="chip">
                          {passport}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {benefits.length > 0 && (
              <section className="mt-10">
                <h2 className="text-h3">What came with it</h2>
                <ul className="mt-5 list-disc space-y-1.5 pl-5 text-ink">
                  {benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </section>
            )}

            {job.body && (
              <section className="mt-10 max-w-[68ch]">
                <h2 className="text-h3">About the role</h2>
                <JobBody body={job.body} />
              </section>
            )}
          </div>
        </div>
      </article>

      <SimilarRolesCallout title={job.title} />

      {more.length > 0 && (
        <section className="mt-16" aria-labelledby="more-placements">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="more-placements" className="text-h2">
              More placements
            </h2>
            <Link
              href="/jobs"
              className="text-fine font-medium text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
            >
              All placements
            </Link>
          </div>
          <ul className="mt-8 grid list-none grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {more.map((other) => (
              <li key={other.slug} className="flex">
                <JobCard job={other} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
