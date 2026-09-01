import type { Metadata } from "next";
import Link from "next/link";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { ApplyPanel, applyHref } from "@/components/ApplyPanel";
import { Button } from "@/components/Button";
import { TideLine } from "@/components/TideLine";
import {
  DEGREE_LABELS,
  EMPLOYER_TYPE_LABELS,
  formatDate,
  formatSalaryRange,
  periodLabel,
} from "@/lib/format";
import {
  buildJobPostingJsonLd,
  fetchAllJobs,
  fetchJob,
  richTextToPlainText,
  type JobWithSlug,
} from "@/lib/jobs";
import { approxGBPRange, type SalaryCurrency } from "@/lib/rates";
import { SITE_URL } from "@/lib/site";

/**
 * /jobs/[slug] — the full listing (PLAN §6): structured facts, rich-text
 * body, sticky apply panel (desktop right rail, mobile bottom bar),
 * JobPosting JSON-LD on every active job (PLAN §9 — the highest-value item
 * in the build), TEFL cross-link where a certificate is required, and the
 * filled state for retired listings (inbound links never 404).
 */

// Every job page is prerendered; the slug list is closed at build time.
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
    title: job.title,
    description:
      description ||
      `${job.title} — teaching vacancy in ${job.cities.join(", ")}, ${job.country}.`,
    alternates: { canonical: `${SITE_URL}/jobs/${slug}` },
    // A retired job keeps its URL but leaves the search index (PLAN §5).
    ...(job.active === false ? { robots: { index: false } } : {}),
  };
}

/** One label/value row in the key-facts panel; rows with no value vanish. */
function Fact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[0.8125rem] font-semibold uppercase tracking-[0.09em] text-flint">
        {label}
      </dt>
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

export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const job = await fetchJob(slug);
  const filled = job.active === false;
  const salary = job.salary;
  const requirements = job.requirements;
  const benefits = (job.benefits ?? []).filter((b): b is string => !!b);
  const passports = (requirements?.passports ?? []).filter(
    (p): p is string => !!p,
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 pb-28 sm:px-6 lg:pb-16">
      {!filled && (
        <script
          type="application/ld+json"
          // JobPosting JSON-LD (PLAN §9). The one sanctioned use of
          // dangerouslySetInnerHTML on the site: React escapes plain text
          // children of <script>, which corrupts JSON, so Next's documented
          // JSON-LD pattern is required. The payload is JSON.stringify of
          // build-time data with `<` escaped — nothing user-supplied at
          // request time, no injection surface.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildJobPostingJsonLd(job)).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
      )}

      <nav aria-label="Breadcrumb" className="text-fine">
        <Link
          href="/jobs"
          className="text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
        >
          ← All teaching jobs
        </Link>
      </nav>

      <div className="mt-8 lg:grid lg:grid-cols-[1fr_20rem] lg:gap-12">
        <article>
          <p className="kicker">
            {job.country} ·{" "}
            {EMPLOYER_TYPE_LABELS[job.employerType] ?? job.employerType}
          </p>
          <h1 className="mt-4 max-w-[24ch] text-h1">{job.title}</h1>
          <TideLine className="mt-4 max-w-40" />
          <p className="mt-5 text-flint">
            {job.cities.join(" · ")} — posted {formatDate(job.postedDate)}
            {job.closingDate
              ? `, closes ${formatDate(job.closingDate)}`
              : null}
          </p>

          {filled && (
            <div className="mt-8 rounded-card border border-gull bg-foam p-8">
              <h2 className="text-h3">This role has been filled</h2>
              <p className="mt-3 max-w-[52ch] text-flint">
                The listing stays here for reference, but the employer is no
                longer taking applications. Similar roles come up regularly.
              </p>
              <div className="mt-5">
                <Button href="/jobs">See our open roles</Button>
              </div>
            </div>
          )}

          {salary && (
            <div className="mt-8 rounded-card border border-gull bg-chalk p-6 shadow-haze">
              <p className="tnum text-[1.9rem] font-semibold leading-tight text-channel">
                {formatSalaryRange(salary)}
                <span className="text-fine font-normal text-flint">
                  {" "}
                  {periodLabel(salary.period)}
                </span>
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-fine text-flint">
                <span className="tnum">
                  {approxGBPRange(
                    salary.min,
                    salary.max ?? undefined,
                    salary.currency as SalaryCurrency,
                  )}
                </span>
                {salary.afterTax && (
                  <span className="rounded-full bg-brand-teal/45 px-2.5 py-0.5 text-[0.8125rem] font-medium text-channel">
                    after tax
                  </span>
                )}
              </p>
            </div>
          )}

          <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <Fact label="Teaching hours" value={job.teachingHours} />
            <Fact label="Office hours" value={job.officeHours} />
            <Fact label="Working pattern" value={job.schedule} />
            <Fact label="Age of students" value={job.studentAges} />
            <Fact label="Class size" value={job.classSize} />
            <Fact
              label="Vacancies"
              value={job.vacancies != null ? String(job.vacancies) : null}
            />
            <Fact label="Start dates" value={job.startDates} />
            <Fact label="Visa support" value={job.visaSupport} />
          </dl>

          {requirements && (
            <section className="mt-10">
              <h2 className="text-h3">Requirements</h2>
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
                  <h3 className="text-[0.8125rem] font-semibold uppercase tracking-[0.09em] text-flint">
                    Passports accepted
                  </h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {passports.map((passport) => (
                      <li
                        key={passport}
                        className="rounded-full bg-foam px-3 py-1 text-fine font-medium text-channel"
                      >
                        {passport}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {requirements?.tefl && !filled && (
            // The natural conversion moment (PLAN §6): the candidate has just
            // discovered they need a certificate they don't have.
            <div className="mt-8 rounded-card border border-gull bg-foam p-6">
              <p className="text-ink">
                No TEFL certificate yet?{" "}
                <Link
                  href="/tefl-course"
                  className="font-medium text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
                >
                  Get 15% off the 120-hour online course →
                </Link>
              </p>
            </div>
          )}

          {benefits.length > 0 && (
            <section className="mt-10">
              <h2 className="text-h3">Salary &amp; benefits</h2>
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
        </article>

        {!filled && (
          <aside className="mt-12 hidden lg:mt-0 lg:block">
            <div className="lg:sticky lg:top-8">
              <ApplyPanel title={job.title} />
            </div>
          </aside>
        )}
      </div>

      {/* Mobile apply bar — the most prominent element on the page (§11.4) */}
      {!filled && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gull bg-chalk/95 p-3 backdrop-blur-sm lg:hidden">
          <a
            href={applyHref(job.title)}
            className="flex w-full items-center justify-center rounded-btn bg-harbour px-5 py-3 font-medium text-chalk transition-colors duration-150 ease-out hover:bg-harbour-deep"
          >
            Apply by email
          </a>
        </div>
      )}
    </div>
  );
}
