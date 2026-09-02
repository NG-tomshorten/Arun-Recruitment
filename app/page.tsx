import Link from "next/link";
import { Button } from "@/components/Button";
import { ChartMotif } from "@/components/ChartMotif";
import { JobCard } from "@/components/JobCard";
import { Shoal } from "@/components/Shoal";
import { Shore } from "@/components/Shore";
import { TideLine } from "@/components/TideLine";
import { fetchActiveJobs, toCardData } from "@/lib/jobs";

/**
 * Home (PLAN §6): the teacher/employer fork up top, then three live roles,
 * the credibility block (capture §2.1, lightly modernised), and the TEFL
 * nudge — placed on the channel deep-end after the sea, the sanctioned
 * "chalk on the deep end" text placement (globals.css sea-fade note).
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
  const jobs = await fetchActiveJobs();
  const cards = jobs.map(toCardData).slice(0, 3);

  return (
    <>
      <section className="relative flex flex-1 flex-col justify-center overflow-hidden">
        <ChartMotif className="text-channel opacity-[0.05]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <p className="kicker">Teacher recruitment</p>
          <h1 className="mt-4 max-w-[22ch] text-display">
            English teaching jobs in Taiwan and China
          </h1>
          <p className="mt-6 max-w-[52ch] text-lead text-flint">
            We place British and Commonwealth graduates into teaching jobs in
            Taiwan and mainland China — and help schools, colleges and
            companies find reliable instructors.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button href="/jobs">I&rsquo;m a teacher looking for work</Button>
            <Button href="/for-employers" variant="secondary">
              I&rsquo;m hiring teachers
            </Button>
          </div>
        </div>
      </section>

      {/* Live roles (PLAN §6) — newest three, straight from the listings */}
      <section className="bg-foam">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <FoamKicker>Open now</FoamKicker>
          <h2 className="mt-4 text-h2">Latest teaching jobs</h2>
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
              See all {jobs.length} open roles →
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
          shoal cruising through; the fade lands on channel so the TEFL band
          below and the footer continue the same water. */}
      <section className="sea-fade relative h-80 overflow-hidden">
        <Shoal />
      </section>

      {/* TEFL nudge (PLAN §6) — chalk text on the deep end */}
      <section className="bg-channel">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-6">
          <h2 className="max-w-[26ch] text-h3 text-chalk">
            Need a TEFL certificate first?
          </h2>
          <p className="mt-4 max-w-[52ch] text-chalk/85">
            Many of our roles ask for one. Our candidates get 15% off
            ITTT&rsquo;s 120-hour online TEFL/TESOL course — recognised by
            schools worldwide, taken at your own pace.
          </p>
          <p className="mt-6">
            <Link
              href="/tefl-course"
              className="font-medium text-chalk underline underline-offset-4 transition-colors duration-150 hover:text-brand-teal"
            >
              About the course and the discount →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
