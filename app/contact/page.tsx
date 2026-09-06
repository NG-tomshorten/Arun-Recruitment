import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageHeader } from "@/components/PageHeader";
import { APPLY_EMAIL, SITE_URL } from "@/lib/site";

/**
 * /contact (PLAN §6): the enquiry form (PLAN §7, relayed by the Worker —
 * worker/index.ts) plus the plain contact details from capture §4. The
 * details column and the <noscript> block are the no-JS path: Turnstile
 * needs JS, so without it the form never appears and email is the way in.
 */

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Get in touch with Arun Language Training & Recruitment — send an enquiry with the contact form, or reach us by email or phone.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function Contact() {
  return (
    <>
      <PageHeader
        kicker="Contact"
        title="Get in touch"
        lead="Send us a message with the form, or reach us directly by email or phone. We reply to every enquiry."
      />
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mt-4 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          <div className="max-w-[38rem]">
            <ContactForm />
            <noscript>
              <div className="card-callout p-8">
                <h2 className="text-h3">Email us instead</h2>
                <p className="mt-3 text-flint">
                  The contact form needs JavaScript. With it switched off,
                  please write to{" "}
                  <a
                    href={`mailto:${APPLY_EMAIL}`}
                    className="select-all font-medium text-harbour-deep underline underline-offset-4"
                  >
                    {APPLY_EMAIL}
                  </a>{" "}
                  — we reply to every enquiry.
                </p>
              </div>
            </noscript>
          </div>

          {/* Plain contact details (capture §4) */}
          <div className="card p-8 lg:self-start">
            <h2 className="text-h3">Contact details</h2>
            <dl className="mt-5 space-y-5">
              <div>
                <dt className="text-fine font-medium text-channel">Email</dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${APPLY_EMAIL}`}
                    className="select-all text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
                  >
                    {APPLY_EMAIL}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-fine font-medium text-channel">Phone</dt>
                <dd className="mt-1 tnum">
                  <a
                    href="tel:+447495368499"
                    className="text-ink transition-colors duration-150 hover:text-harbour-deep"
                  >
                    +44 (0)7495 368 499
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-fine font-medium text-channel">
                  Registered office
                </dt>
                <dd className="mt-1 text-flint">
                  Arun Language Training &amp; Recruitment Ltd
                  <br />7 Goda Road, Littlehampton
                  <br />
                  BN17 6AS, United Kingdom
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
