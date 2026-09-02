import type { Metadata } from "next";
import { ProfileWizard } from "@/components/ProfileWizard";
import { TideLine } from "@/components/TideLine";
import { APPLY_EMAIL, SITE_URL } from "@/lib/site";

/**
 * /profile — the Teacher Profile wizard (PLAN amendment 2 Sep 2026
 * (profile)): six questions plus contact details and a CV, relayed to
 * Barry's inbox by the Worker (worker/index.ts) and never stored. The
 * <noscript> block is the no-JS path: Turnstile needs JS, so without it
 * the wizard never appears and email is the way in.
 */

export const metadata: Metadata = {
  title: "Teacher profile",
  description:
    "Create your teacher profile — six short questions about where you'd like to teach in China, your documents and your CV, sent straight to us.",
  alternates: { canonical: `${SITE_URL}/profile` },
};

export default function Profile() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <p className="kicker">Teacher profile</p>
      <h1 className="mt-4 max-w-[24ch] text-h1">
        Create your teacher profile
      </h1>
      <TideLine className="mt-4 max-w-40" />
      <p className="mt-6 max-w-[62ch] text-lead text-flint">
        Six short questions about where you&rsquo;d like to teach and where
        you&rsquo;ve got to with your documents, then your CV. It goes
        straight to Barry, who reads every profile himself.
      </p>

      <div className="mt-12 max-w-[38rem]">
        <ProfileWizard />
        <noscript>
          <div className="rounded-card border border-gull bg-foam p-8">
            <h2 className="text-h3">Email us instead</h2>
            <p className="mt-3 text-flint">
              The profile form needs JavaScript. With it switched off, please
              email your CV to{" "}
              <a
                href={`mailto:${APPLY_EMAIL}`}
                className="select-all font-medium text-harbour-deep underline underline-offset-4"
              >
                {APPLY_EMAIL}
              </a>{" "}
              with a note on where you&rsquo;d like to teach — we reply to
              every enquiry.
            </p>
          </div>
        </noscript>
      </div>
    </div>
  );
}
