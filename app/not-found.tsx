import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { ChartMotif } from "@/components/ChartMotif";
import { Gull } from "@/components/Gull";
import { NAV_LINKS } from "@/components/nav";

/**
 * The custom not-found page (PLAN §4, copy line from PLAN §6). Static export
 * renders it to 404.html, so Cloudflare serves it for every unmatched path.
 *
 * It also catches /gdpr-consent: that page already 404s on the live site, and
 * PLAN §4 says to leave it dead — no redirect in public/_redirects, no sitemap
 * entry. This page is deliberately where it lands.
 *
 * One of the two sanctioned placements of the gull glyph (components/Gull.tsx).
 */

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "That page has moved or no longer exists. Browse our English-teaching jobs in Taiwan and China, or get in touch.",
};

export default function NotFound() {
  return (
    <section className="relative flex flex-1 flex-col justify-center overflow-hidden">
      <ChartMotif className="text-channel opacity-[0.035]" />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <Gull className="h-12 w-24 text-harbour" />

        <p className="kicker mt-8">Error 404</p>
        <h1 className="mt-4 max-w-[18ch] text-h1">
          This page seems to have flown.
        </h1>
        <p className="mt-6 max-w-[52ch] text-lead text-flint">
          The page you were after has either moved or no longer exists — quite
          possibly a role that has since been filled. Nothing is lost:
          everything we currently have is a click away.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button href="/jobs">See our teaching jobs</Button>
          <Button href="/" variant="secondary">
            Back to the home page
          </Button>
        </div>

        <p className="mt-10 text-fine text-flint">
          Still stuck?{" "}
          <Link
            href="/contact"
            className="text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
          >
            Get in touch
          </Link>{" "}
          and we will point you in the right direction.
        </p>

        <nav aria-label="Elsewhere on the site" className="mt-12">
          <h2 className="kicker text-flint">Elsewhere on the site</h2>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-fine">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-harbour-deep underline underline-offset-4 transition-colors duration-150 hover:text-harbour"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
