import type { Metadata } from "next";
import { TideLine } from "@/components/TideLine";
import { SITE_URL } from "@/lib/site";

/**
 * /for-employers (PLAN §6): the seven-service menu as a clean grid with
 * one-line descriptions written fresh (the old site has none — capture
 * §2.2), and Barry's direct email as the CTA. Intro copy from capture §2.2,
 * lightly modernised; the live "Servcices" typo is not carried over
 * (CLAUDE.md guardrail 3).
 */

const EMPLOYER_EMAIL = "barry.shorten@arunlanguagetraining.com";

// The seven services, in the order the old site lists them (capture §2.2).
// Descriptions are ours — one plain line each, no recruitment-industry filler.
const SERVICES: { name: string; description: string }[] = [
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
    name: "Visa Support",
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
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <p className="kicker">For employers</p>
      <h1 className="mt-4 max-w-[24ch] text-h1">Recruitment services</h1>
      <TideLine className="mt-4 max-w-40" />
      <p className="mt-6 max-w-[62ch] text-lead text-flint">
        Arun Language Training &amp; Recruitment Ltd offers recruitment
        services to UK and international organisations requiring English
        language instructors and other subject specialists. We aim to provide
        high-calibre candidates with a high level of reliability.
      </p>

      <ul className="mt-12 grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <li
            key={service.name}
            className="rounded-card border border-gull bg-chalk p-6 shadow-haze"
          >
            <h2 className="text-h3">{service.name}</h2>
            <p className="mt-2 text-fine text-flint">{service.description}</p>
          </li>
        ))}
        {/* The CTA takes the grid's last cell — the menu leads straight to Barry */}
        <li className="rounded-card border border-harbour bg-foam p-6 shadow-haze">
          <h2 className="text-h3">Start a conversation</h2>
          <p className="mt-2 text-fine text-flint">
            Take the full menu or just the parts you need.
          </p>
          <a
            href={`mailto:${EMPLOYER_EMAIL}`}
            className="mt-4 inline-block font-medium text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
          >
            Email Barry Shorten
          </a>
        </li>
      </ul>

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
  );
}
