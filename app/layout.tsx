import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

// Self-hosted via next/font (PLAN §11.2). Fraunces: optical size on,
// SOFT/WONK left at their 0 defaults.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:
      "Arun Language Training & Recruitment — English teaching jobs in Taiwan and China",
    template: "%s — Arun Language Training & Recruitment",
  },
  description:
    "Teacher recruitment from West Sussex: English-teaching placements in Taiwan and mainland China for British and Commonwealth graduates, and recruitment services for schools and employers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${fraunces.variable} ${inter.variable} h-full`}
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
      </body>
    </html>
  );
}
