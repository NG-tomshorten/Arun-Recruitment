import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ServiceMenu, type Service } from "@/components/ServiceMenu";
import { SITE_URL } from "@/lib/site";

/**
 * /for-employers (PLAN §6): the seven-service menu as a row with
 * one-line descriptions written fresh (the old site has none — capture
 * §2.2), and Barry's direct email as the CTA. Intro copy from capture §2.2,
 * lightly modernised; the live "Servcices" typo is not carried over
 * (CLAUDE.md guardrail 3). Compact pass, 7 Sep 2026: the list became the
 * hover-to-reveal row in components/ServiceMenu.tsx.
 */

const EMPLOYER_EMAIL = "barry.shorten@arunlanguagetraining.com";

// The seven services, in the order the old site lists them (capture §2.2).
// Descriptions are ours — one plain line each, no recruitment-industry filler.
const SERVICES: Service[] = [
  {
    name: "Advertising",
    description:
      "Your vacancy written up properly and placed where the right candidates are looking.",
  },
  {
    name: "Shortlisting",
    description:
      "Applications sifted against your requirements, so you only see candidates worth your time.",
  },
  {
    name: "Interviewing",
    description:
      "First-round interviews conducted and written up before anyone reaches you.",
  },
  {
    name: "Selection",
    description:
      "Help weighing the final candidates, with qualifications and references checked.",
  },
  {
    name: "Induction",
    description:
      "New teachers briefed on the role, the school and the country before they start.",
  },
  {
    name: "Visa support",
    description:
      "The work-permit and visa paperwork guided through, for you and the teacher.",
  },
  {
    name: "Mobilisation",
    description:
      "Travel and arrival coordinated so your teacher lands, settles and starts on time.",
  },
];

export const metadata: Metadata = {
  title: "Recruitment services for employers",
  description:
    "Teacher recruitment for UK and international schools, colleges and companies: advertising, shortlisting, interviewing, selection, induction, visa support and mobilisation.",
  alternates: { canonical: `${SITE_URL}/for-employers` },
};

export default function ForEmployers() {
  return (
    <>
      <PageHeader
        kicker="For employers"
        title="Recruitment services"
        lead={
          <>
            Arun Language Training &amp; Recruitment Ltd offers recruitment
            services to UK and international organisations requiring English
            language instructors and other subject specialists. We aim to
            provide high-calibre candidates with a high level of reliability.
          </>
        }
      />
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        {/* The seven services in one row — hover, focus or tap a service and
          its line shows beneath the row; the one card below (the CTA) stays
          the page's loud element. Pulled up under the lead (-mt-3 against the
          header band's own padding) so the menu reads as part of it. */}
        <div className="-mt-3">
          <ServiceMenu services={SERVICES} />
        </div>

        {/* The menu leads straight to Barry */}
        <div className="card-callout mt-10 max-w-[44rem] p-8">
          <h2 className="text-h3">Start a conversation</h2>
          <p className="mt-2 text-flint">
            Take the full menu or just the parts you need.
          </p>
          <a
            href={`mailto:${EMPLOYER_EMAIL}`}
            className="mt-5 inline-flex items-center justify-center rounded-btn border-[1.5px] border-harbour bg-harbour px-5 py-2.5 font-medium text-chalk shadow-lift transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out hover:border-harbour-deep hover:bg-harbour-deep active:translate-y-px active:shadow-none"
          >
            Email Barry Shorten
          </a>
        </div>

        <p className="mt-10 max-w-[62ch] text-flint">
          If you are interested in recruiting English language instructors, EFL
          teachers or other subject specialists, contact Barry Shorten directly:{" "}
          <a
            href={`mailto:${EMPLOYER_EMAIL}`}
            className="select-all text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
          >
            {EMPLOYER_EMAIL}
          </a>
        </p>
      </div>
    </>
  );
}
