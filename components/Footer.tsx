import Link from "next/link";
import { Gull } from "./Gull";
import { NAV_LINKS } from "./nav";

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/Arun-Language-Training-Recruitment-Ltd-193363187707948/",
  },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/10206087/" },
  { label: "Instagram", href: "https://www.instagram.com/arun_recruitment/" },
  { label: "X (Twitter)", href: "https://twitter.com/arunrecruitment/" },
] as const;

export function Footer() {
  return (
    <footer className="bg-channel text-chalk">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6">
        {/* The gull on its horizon rule (PLAN §11.4) */}
        <div className="flex items-end" aria-hidden="true">
          <span className="mb-[4.5px] flex-1 border-t border-chalk/25" />
          <Gull withHorizon={false} className="h-6 w-12 text-brand-teal" />
          <span className="mb-[4.5px] flex-1 border-t border-chalk/25" />
        </div>

        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg text-chalk">
              Arun Language Training &amp; Recruitment Ltd
            </p>
            <address className="mt-3 text-fine not-italic text-chalk/80">
              7 Goda Road
              <br />
              Littlehampton
              <br />
              BN17 6AS, United Kingdom
            </address>
          </div>
          <div>
            <h2 className="text-fine font-semibold uppercase tracking-[0.09em] text-chalk/60 font-sans">
              Get in touch
            </h2>
            <ul className="mt-3 space-y-2 text-fine">
              <li>
                <a
                  href="mailto:info@arunlanguagetraining.com"
                  className="text-chalk/85 underline underline-offset-4 transition-colors duration-150 hover:text-chalk"
                >
                  info@arunlanguagetraining.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+447495368499"
                  className="text-chalk/85 transition-colors duration-150 hover:text-chalk"
                >
                  +44 (0)7495 368 499
                </a>
              </li>
              {SOCIAL_LINKS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="text-chalk/85 underline underline-offset-4 transition-colors duration-150 hover:text-chalk"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-fine font-semibold uppercase tracking-[0.09em] text-chalk/60 font-sans">
              Site
            </h2>
            <ul className="mt-3 space-y-2 text-fine">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-chalk/85 transition-colors duration-150 hover:text-chalk"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/privacy"
                  className="text-chalk/85 transition-colors duration-150 hover:text-chalk"
                >
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-chalk/15 pt-6 text-[0.8125rem] text-chalk/60">
          {`© ${new Date().getFullYear()} Arun Language Training & Recruitment Ltd. Registered in England & Wales, company no. 9744912.`}
        </p>
      </div>
    </footer>
  );
}
