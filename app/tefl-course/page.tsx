import type { Metadata } from "next";
import Link from "next/link";
import { TideLine } from "@/components/TideLine";
import { APPLY_EMAIL, SITE_URL } from "@/lib/site";

/**
 * /tefl-course (PLAN §6): the ITTT 120-hour online course, copy from
 * capture §2.3 (the live portion only). The affiliate link carries
 * rel="sponsored". The retired "Accredited by the Australian Government"
 * claim is never carried over (CLAUDE.md guardrail 3).
 */

const AFFILIATE_URL = "https://www.teflcourse.net/apply/?cu=LNMSR2017C";
const DISCOUNT_CODE = "LNMSR2017C";

export const metadata: Metadata = {
  title: "TEFL / TESOL course — 15% off the 120-hour online programme",
  description:
    "Take ITTT's 120-hour online TEFL/TESOL course at your own pace, with a 15% discount for our candidates. The certificate is recognised by schools worldwide.",
  alternates: { canonical: `${SITE_URL}/tefl-course` },
};

export default function TeflCourse() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <p className="kicker">TEFL course</p>
      <h1 className="mt-4 max-w-[24ch] text-h1">
        Online TEFL/TESOL programme, 120 hours
      </h1>
      <TideLine className="mt-4 max-w-40" />

      <div className="mt-6 max-w-[62ch] space-y-5 text-lead text-flint">
        <p>
          The online TEFL/TESOL programme with ITTT can be taken remotely
          anywhere in the world. The programme is 120 hours, completed in your
          own time and at your own pace. The ITTT certificate is recognised by
          schools globally — a passport to the world.
        </p>
        <p>
          The fee for the online programme currently stands at{" "}
          <span className="tnum">US $249</span>, and applying through the link
          below arranges a <strong className="text-ink">15% discount</strong>{" "}
          on that fee.
        </p>
      </div>

      <div className="mt-10 max-w-[62ch] rounded-card border border-gull bg-foam p-8">
        <h2 className="text-h3">Claim the 15% discount</h2>
        <p className="mt-3 text-fine text-flint">
          Apply using this link, or quote the code{" "}
          <code className="select-all rounded bg-chalk px-1.5 py-0.5 font-sans font-semibold text-ink">
            {DISCOUNT_CODE}
          </code>{" "}
          when booking your course.
        </p>
        <a
          href={AFFILIATE_URL}
          rel="sponsored noopener"
          className="mt-5 inline-flex items-center justify-center rounded-btn bg-harbour px-5 py-3 font-medium text-chalk transition-colors duration-150 ease-out hover:bg-harbour-deep"
        >
          Apply with the discount at teflcourse.net
        </a>
        <p className="mt-4 text-[0.8125rem] text-flint">
          The link goes to ITTT&rsquo;s site; the discount is applied there.
          Good luck!
        </p>
      </div>

      <div className="mt-10 max-w-[62ch] space-y-5 text-flint">
        <p>
          A TEFL certificate opens up the roles that require one —{" "}
          <Link
            href="/jobs"
            className="text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
          >
            see the current listings
          </Link>
          . Interested applicants should email{" "}
          <a
            href={`mailto:${APPLY_EMAIL}`}
            className="select-all text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
          >
            {APPLY_EMAIL}
          </a>{" "}
          for further details.
        </p>
      </div>
    </div>
  );
}
