import Link from "next/link";
import { Button } from "@/components/Button";
import { ChartMotif } from "@/components/ChartMotif";
import { JobCard } from "@/components/JobCard";
import { Shoal } from "@/components/Shoal";
import { Shore } from "@/components/Shore";
import { TideLine } from "@/components/TideLine";
import { fetchShownJobs, toCardData } from "@/lib/jobs";

/**
 * Home (PLAN §6, amended 2 Sep 2026): the teacher/employer fork up top,
 * then the three newest placements (the /jobs listings are a record of
 * roles we filled, not open vacancies), the credibility block (capture
 * §2.1, lightly modernised), and the teacher CV call — placed on the
 * channel deep-end after the sea, the sanctioned "chalk on the deep end"
 * text placement (globals.css sea-fade note).
 */

/** Kicker for foam sections — same treatment as the `kicker` utility but in
 *  harbour-deep: raw harbour misses AA on foam (see check-contrast.mjs). */
function FoamKicker({ children }: { children: string }) {
  return (
    <p className="font-sans text-[0.8125rem] font-semibold uppercase tracking-[0.09em] text-harbour-deep">
      {children}
    </p>
  );
}

export default async function Home() {
  const jobs = await fetchShownJobs();
  const cards = jobs.map(toCardData).slice(0, 3);

  return (
    <>
      <section className="relative flex flex-1 flex-col justify-center overflow-hidden">
        <ChartMotif className="text-channel opacity-[0.05]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <p className="kicker">Teacher recruitment</p>
          <h1 className="mt-4 max-w-[22ch] text-display">
            We place English teachers in Taiwan and China
          </h1>
          <p className="mt-6 max-w-[52ch] text-lead text-flint">
            We find teaching posts in Taiwan and mainland China for British
            and Commonwealth graduates — and reliable instructors for the
            schools, colleges and companies that need them.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button href="/contact">I&rsquo;m a teacher looking for work</Button>
            <Button href="/for-employers" variant="secondary">
              I&rsquo;m hiring teachers
            </Button>
          </div>
        </div>
      </section>

      {/* Recent placements (PLAN §6, amended) — newest three */}
      <section className="bg-foam">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <FoamKicker>Placements</FoamKicker>
          <h2 className="mt-4 text-h2">Teaching jobs we&rsquo;ve filled</h2>
          <ul className="mt-8 grid list-none grid-cols-1 gap-6 md:grid-cols-3">
            {cards.map((job) => (
              <li key={job.slug} className="flex">
                <JobCard job={job} />
              </li>
            ))}
          </ul>
          <p className="mt-8">
            <Link
              href="/jobs"
              className="font-medium text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
            >
              See all {jobs.length} placements →
            </Link>
          </p>
        </div>
      </section>

      {/* Credibility block — capture §2.1, lightly modernised (PLAN §6) */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="kicker">Who we are</p>
        <h2 className="mt-4 max-w-[26ch] text-h2">
          A recruitment company on the Sussex coast
        </h2>
        <TideLine className="mt-4 max-w-40" />
        <div className="mt-6 max-w-[62ch] space-y-5 text-lead text-flint">
          <p>
            Arun Language Training &amp; Recruitment Ltd is a teacher
            recruitment company based in West Sussex, on the south coast of
            England. We support companies, schools and colleges with their
            recruitment, and help teachers find the right job — and we aim to
            make the process as smooth and simple as possible.
          </p>
          <p>
            We work with clients in Taiwan and mainland China to recruit
            teachers for kindergartens, primary schools, universities and
            language schools, and from time to time for other teaching-related
            positions. If you are hiring,{" "}
            <Link
              href="/for-employers"
              className="text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
            >
              see what we do for employers
            </Link>{" "}
            or{" "}
            <Link
              href="/contact"
              className="text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
            >
              get in touch
            </Link>
            .
          </p>
        </div>
      </section>

      <Shore />
      {/* Shallows deepening into the channel (sea-fade, globals.css), the
          shoal cruising through; the fade lands on channel so the teacher
          band below and the footer continue the same water. */}
      <section className="sea-fade relative h-80 overflow-hidden">
        <Shoal />
      </section>

      {/* Teacher CV call (PLAN §6, amended) — chalk text on the deep end */}
      <section className="bg-channel">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-6">
          <h2 className="max-w-[26ch] text-h3 text-chalk">
            Looking to teach abroad?
          </h2>
          <p className="mt-4 max-w-[52ch] text-chalk/85">
            Email us your CV with your nationality and teaching
            qualifications, and we will be in touch when a suitable role
            comes up.
          </p>
          <p className="mt-6">
            <Link
              href="/contact"
              className="font-medium text-chalk underline underline-offset-4 transition-colors duration-150 hover:text-brand-teal"
            >
              Get in touch →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
