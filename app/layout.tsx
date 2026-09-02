import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Self-hosted via next/font (PLAN §11.2). Montserrat chosen by Barry at
// Checkpoint A (Aug 2026) from the font-lab comparison, replacing Fraunces.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Arun Language Training & Recruitment — English teacher recruitment for Taiwan and China",
    template: "%s — Arun Language Training & Recruitment",
  },
  description:
    "Teacher recruitment from West Sussex: English-teaching placements in Taiwan and mainland China for British and Commonwealth graduates, and recruitment services for schools and employers.",
  // One static OG card for every page (PLAN §9, simplified by choice —
  // no per-placement image generation). public/images/og.png.
  openGraph: {
    siteName: "Arun Language Training & Recruitment",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "/images/og.png",
        width: 1200,
        height: 630,
        alt: "Arun Language Training & Recruitment — English teacher recruitment for Taiwan and China",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${montserrat.variable} ${inter.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-btn focus:bg-channel focus:px-4 focus:py-2 focus:text-chalk"
        >
          Skip to content
        </a>
        {/* Header + main together fill exactly one viewport, so the footer's
            top edge sits on the fold; a page's hero grows into the spare
            height via flex-1 */}
        <div className="flex min-h-svh flex-1 flex-col">
          <Header />
          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>
        </div>
        <Footer />
        {/* Cloudflare Web Analytics (PLAN §9) — cookieless, the one
            permitted analytics script. The token is set in the deploy
            environment (PLAN §13 step 8); without it, no script ships. */}
        {process.env.NEXT_PUBLIC_CF_BEACON_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({
              token: process.env.NEXT_PUBLIC_CF_BEACON_TOKEN,
            })}
          />
        )}
      </body>
    </html>
  );
}
