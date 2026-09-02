import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/Button";
import { ChartMotif } from "@/components/ChartMotif";
import { Gull } from "@/components/Gull";
import { Shore } from "@/components/Shore";
import { TideLine } from "@/components/TideLine";
import { approxGBPRange } from "@/lib/rates";

// Dev-only reference page: noindexed here, excluded from the sitemap in
// build step 6, and never linked from the site.
export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const TOKENS = [
  { name: "chalk", hex: "#FAF7F2", use: "Page background", light: true },
  { name: "foam", hex: "#EDF2F2", use: "Section washes, chips", light: true },
  { name: "shingle", hex: "#E8E1D5", use: "Occasional warm surface", light: true },
  { name: "gull", hex: "#B7C2C7", use: "Hairlines, borders, dividers", light: true },
  { name: "flint", hex: "#55646B", use: "Secondary text" },
  { name: "ink", hex: "#1E2C31", use: "Body text" },
  { name: "channel", hex: "#122E36", use: "Headings, footer background" },
  {
    name: "brand-teal",
    hex: "#8CC1C7",
    use: "THE brand accent — the logo teal. Washes, tide line, fills with dark text; never text on light",
    light: true,
  },
  {
    name: "shallows",
    hex: "#ADCED0",
    use: "Shallow water — teal section wash below the shore; ink text only",
    light: true,
  },
  { name: "harbour", hex: "#2C7A86", use: "Brand-teal deepened for AA — primary buttons, active states" },
  { name: "harbour-deep", hex: "#1F5763", use: "Links on light, hover/pressed" },
  { name: "beak", hex: "#D9A441", use: "Tiny highlights only", light: true },
  { name: "beak-deep", hex: "#B67F1E", use: "Focus rings" },
  { name: "rust", hex: "#A94438", use: "Form errors" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      <h2 className="text-h2">{title}</h2>
      <TideLine className="mt-3 max-w-40" />
      <div className="mt-8">{children}</div>
    </section>
  );
}

function SampleJobCard() {
  return (
    <article className="max-w-sm rounded-card border border-gull bg-chalk p-6 shadow-haze transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-harbour">
      <div>
        <h3 className="text-h3">Chengdu, China</h3>
        <p className="mt-1 text-fine text-flint">Kindergarten · 3–6 year olds</p>
      </div>
      <p className="tnum mt-5 text-[1.55rem] font-semibold leading-tight text-channel">
        RMB 21,000–23,000
        <span className="text-fine font-normal text-flint"> / month</span>
      </p>
      <p className="mt-1 flex flex-wrap items-center gap-2 text-fine text-flint">
        <span className="tnum">{approxGBPRange(21000, 23000, "RMB")}</span>
        <span className="rounded-full bg-brand-teal/45 px-2.5 py-0.5 text-[0.8125rem] font-medium text-channel">
          after tax
        </span>
      </p>
      <ul className="mt-5 space-y-1.5 text-fine text-ink">
        <li>Housing allowance, RMB 1,500 / month</li>
        <li>Medical insurance provided</li>
      </ul>
      <p className="mt-5 border-t border-gull/50 pt-4 text-[0.8125rem] text-flint">
        July 2026
      </p>
    </article>
  );
}

export default function Styleguide() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="kicker">Checkpoint A</p>
      <h1 className="mt-4 text-h1">Design system</h1>
      <p className="mt-4 max-w-[68ch] text-flint">
        Dev-only reference for the Arun coast design system (PLAN §11). Not
        linked from the site, noindexed, and excluded from the sitemap.
      </p>

      <Section title="Palette">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {TOKENS.map((t) => (
            <div
              key={t.name}
              className="overflow-hidden rounded-card border border-gull/60 bg-white/40"
            >
              <div
                className={`h-20 ${t.light ? "border-b border-gull/40" : ""}`}
                style={{ backgroundColor: t.hex }}
              />
              <div className="p-3">
                <p className="font-semibold text-channel">{t.name}</p>
                <p className="tnum text-[0.8125rem] text-flint">{t.hex}</p>
                <p className="mt-1 text-[0.8125rem] leading-snug text-flint">
                  {t.use}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[68ch] text-fine text-flint">
          Usage discipline: ~80% neutrals, ~15% teals (brand-teal + harbour),
          ~5% amber. brand-teal #8CC1C7 is the confirmed main brand accent,
          sampled exactly from the logo&rsquo;s teal gull — it appears as the
          tide line, selection highlight, light fills (the &ldquo;after
          tax&rdquo; pill) and the footer gull; harbour is its AA-passing deep
          form for buttons, links and kickers. Contrast pairs are asserted by{" "}
          <code>scripts/check-contrast.mjs</code> on every build. Two
          deviations from the plan&rsquo;s draft hexes, both forced by that
          gate: harbour deepened from #2E7D8A to #2C7A86 (chalk text on it was
          4.45:1, just under AA), and beak-deep added because raw beak misses
          the 3:1 non-text minimum for focus rings on chalk.
        </p>
      </Section>

      <Section title="Brand mark">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-center rounded-card border border-gull/60 bg-chalk p-8 sm:col-span-2">
            <Image
              src="/images/logo.png"
              alt="Arun Language Training & Recruitment mark — three gulls"
              width={720}
              height={366}
              className="h-auto w-full max-w-72"
            />
          </div>
          <div className="flex items-center justify-center rounded-card border border-gull/60 bg-white p-8">
            <Image
              src="/images/logo-square.png"
              alt="Square lockup with company name"
              width={512}
              height={512}
              className="h-auto w-full max-w-40"
            />
          </div>
        </div>
        <p className="mt-4 max-w-[68ch] text-fine text-flint">
          The original mark (media pack from Barry, Aug 2026): one gull in
          brand-teal #8CC1C7 — the main brand accent, sampled from this
          artwork — and two in charcoal, close to channel. Used in the header,
          favicon, and later the JSON-LD
          organisation logo and OG images. Originals (PSDs + Futura Light TTF)
          live in <code>brand/</code> — the Futura TTF is desktop-licensed
          only and must never be web-embedded; site type is Montserrat +
          Inter.
        </p>
      </Section>

      <Section title="Type">
        <p className="mb-8 max-w-[68ch] text-fine text-flint">
          Display face: Montserrat, semibold — chosen by Barry at Checkpoint A
          (Aug 2026) from an eleven-candidate comparison, replacing the
          plan&rsquo;s original Fraunces. It echoes the geometric Futura Light
          of the logo lockup, which itself is desktop-licensed and can&rsquo;t
          be web-embedded.
        </p>
        <div className="space-y-8">
          <div>
            <p className="text-[0.8125rem] text-flint">display — Montserrat</p>
            <p className="font-display text-display font-semibold text-channel">
              Where the Arun meets the sea
            </p>
          </div>
          <div>
            <p className="text-[0.8125rem] text-flint">h1</p>
            <p className="font-display text-h1 font-semibold text-channel">
              Teaching jobs in Taiwan and China
            </p>
          </div>
          <div>
            <p className="text-[0.8125rem] text-flint">h2</p>
            <p className="font-display text-h2 font-semibold text-channel">
              Salary, hours and what&rsquo;s included
            </p>
          </div>
          <div>
            <p className="text-[0.8125rem] text-flint">h3</p>
            <p className="font-display text-h3 font-semibold text-channel">
              Requirements at a glance
            </p>
          </div>
          <div>
            <p className="text-[0.8125rem] text-flint">kicker</p>
            <p className="kicker">Teach in Taiwan</p>
          </div>
          <div className="max-w-[68ch]">
            <p className="text-[0.8125rem] text-flint">lead + body — Inter</p>
            <p className="text-lead text-flint">
              A real person in Littlehampton who will answer your email — not a
              faceless job board.
            </p>
            <p className="mt-4">
              We place British and Commonwealth graduates into English-teaching
              jobs in Taiwan and mainland China. Salaries are quoted in the
              local currency with an approximate sterling figure alongside, and
              every listing says plainly whether the figure is before or after
              tax. Body text is Inter at 17px with a 1.65 line height, capped
              at roughly 68 characters per line.
            </p>
          </div>
          <div>
            <p className="text-[0.8125rem] text-flint">
              tabular figures (.tnum) — salary settings
            </p>
            <p className="tnum text-h3 font-sans font-semibold text-channel">
              NT$650–800 / hour · RMB 21,000–23,000 / month
            </p>
          </div>
        </div>
      </Section>

      <Section title="Motifs">
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-fine text-flint">
              The single-gull glyph — footer horizon and 404 only (the header
              and favicon carry the real brand mark). Nowhere else.
            </p>
            <Gull className="h-12 w-24 text-harbour" />
          </div>
          <div>
            <p className="mb-2 text-fine text-flint">
              The tide line — section divider and kicker underline. The only
              wave on the site.
            </p>
            <TideLine />
          </div>
          <div>
            <p className="mb-2 text-fine text-flint">
              The shore — the same wave, alive: three brand-teal swells
              drifting and rising out of phase, foam breaking on the front
              crest. Home hero only. Stills under prefers-reduced-motion.
            </p>
            <Shore />
          </div>
          <div>
            <p className="mb-2 text-fine text-flint">
              The chart — Arun mouth at 5% on chalk. Hero only; never behind
              body text.
            </p>
            <div className="relative h-56 overflow-hidden rounded-card border border-gull/60 bg-chalk">
              <ChartMotif className="text-channel opacity-[0.05]" />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Buttons & chips">
        <div className="flex flex-wrap items-center gap-4">
          <Button href="/jobs">I&rsquo;m a teacher looking for work</Button>
          <Button href="/for-employers" variant="secondary">
            I&rsquo;m hiring teachers
          </Button>
        </div>
        <p className="mt-4 text-fine text-flint">
          Hover: primary deepens to harbour-deep, secondary washes foam. Tab to
          either button to see the beak-deep focus ring (2px, 2px offset).
        </p>
        <div className="mt-8 flex flex-wrap gap-2.5">
          <span className="rounded-full bg-foam px-3.5 py-1.5 text-fine font-medium text-channel">
            Taiwan
          </span>
          <span className="rounded-full bg-channel px-3.5 py-1.5 text-fine font-medium text-chalk">
            China
          </span>
          <span className="rounded-full bg-foam px-3.5 py-1.5 text-fine font-medium text-channel">
            Kindergarten
          </span>
          <span className="rounded-full bg-foam px-3.5 py-1.5 text-fine font-medium text-channel">
            University
          </span>
        </div>
        <p className="mt-3 text-fine text-flint">
          Filter chips: foam/channel idle; the active chip inverts to
          channel/chalk.
        </p>
      </Section>

      <Section title="Placement card">
        <div className="rounded-card bg-foam p-8">
          <SampleJobCard />
        </div>
        <p className="mt-4 max-w-[68ch] text-fine text-flint">
          Chalk card on a foam section: location first, salary large in tabular
          figures with the approx-£ beneath in flint, &ldquo;after tax&rdquo;
          pill where true, two strongest benefits, the month of the placement.
          Hover lifts 2px and shifts the border to harbour. GBP figure computed
          from <code>lib/rates.ts</code> at build time.
        </p>
      </Section>

      <Section title="Form error">
        <div className="max-w-sm">
          <label
            htmlFor="sg-email"
            className="block text-fine font-medium text-channel"
          >
            Email address
          </label>
          <input
            id="sg-email"
            type="email"
            defaultValue="not-an-email"
            aria-invalid="true"
            aria-describedby="sg-email-error"
            className="mt-1.5 w-full rounded-btn border-[1.5px] border-rust bg-white px-3.5 py-2.5 text-ink"
          />
          <p id="sg-email-error" className="mt-1.5 text-fine text-rust">
            Please enter a valid email address.
          </p>
        </div>
      </Section>
    </div>
  );
}
