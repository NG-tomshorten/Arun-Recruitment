# Build history

What has been built, newest at the bottom, so a reader can see how the site got here. This is
**not** the to-do list: open work lives in GitHub issues (code) and in Asana (infrastructure,
accounts, Barry's sign-offs, launch). See `CLAUDE.md`, "Finding work". Add an entry when a
meaningful piece lands, and keep it short; the code, the commit history and the closed tickets
carry the detail. Trade-offs go in `DECISIONS.md`, not here.

Steps 1–7 below follow the original build order (`docs/SPEC.md` Appendix A.7). What was left of
steps 8–10 on 24 Oct 2026 became tickets, as did the deploy-time items queued here (the Worker's
`/api/profile` route, Resend attachments, the Turnstile and beacon build variables) and Barry's
three open sign-offs.

## Done

### Step 1 — scaffold + design system (1 Aug 2026)
Scaffold, design tokens, layout shell, gull, chart motif, tide line, `/styleguide`, Barry's brand
media pack. **Checkpoint A closed:** Barry chose Montserrat from eleven candidates (SPEC §11.2).

### Step 2 — Tina schema + content (31 Aug 2026)
`tina/config.ts`, the ten listings in `content/jobs/`, local mode (`npm run dev` runs
`tinacms dev`). `/privacy`, the 404 page and `public/_redirects` landed alongside.
**Checkpoint B closed (1 Sep 2026):** full Barry walkthrough in the admin — create, slug lock,
no delete/rename, edit round-trip.

### Step 3 — `/jobs` index and `/jobs/[slug]` (1 Sep 2026)
Filters, sort and shareable URL params on the index; full placement page consuming Tina's
generated client and types.

### Step 4 — home, `/for-employers`, `/tefl-course` (2 Sep 2026)
`/for-employers`: the seven services with fresh one-liners and Barry's email CTA.
`/tefl-course` was deleted the same day by the pivot below.

### Step 5 — `/contact` + the Worker contact route (2 Sep 2026)
Form hidden until hydration with a `<noscript>` mailto; `worker/` implements the full SPEC §8.3
stack (origin check, honeypot, time-trap, validation + CRLF strip, Turnstile, Resend relay).
`npm test` runs the unit harness that covers every branch.

### Pivot — placements, not a job board (2 Sep 2026)
Barry: the ten listings were already-filled roles. `/jobs` is now a record of placements
(no apply flows, no JobPosting JSON-LD, month + year dates, `active` only hides); `/tefl-course`
deleted, its legacy redirect re-pointed at `/`; teacher CTAs go to `/contact` and mailto.
Recorded as an amendment to the plan, now folded into `docs/SPEC.md` §5–§6. The home page was then reverted
to the minimal Checkpoint-A shape (hero fork + sea scene, no content fetch).

### Step 6 — sitemap, robots, metadata, OG, icons, beacon (2 Sep 2026)
`sitemap.ts` (excludes hidden placements, `/styleguide`, `/admin`), `robots.ts`, root-layout
metadata, one static OG card (`public/images/og.png` from `scripts/og-card.html`), apple-icon and
manifest icons, Cloudflare beacon in the layout (dormant until the token is set).

### Step 7 — security + quality pass (2 Sep 2026)
`public/_headers` (SPEC §8.2 suite; CSP trade-off in `DECISIONS.md`), `security.txt`,
dependency audit (next bumped, `qs` pinned, five moderates accepted — see `DECISIONS.md`).
Lighthouse: `/` 96/100/100/100, `/jobs` 99/100/100/100, placement page 97/100/100/100.

### Teacher Profile wizard — `/profile` (2 Sep 2026; Taiwan set 6 Sep 2026)
Client-side wizard in `components/ProfileWizard.tsx`, forking on a China/Taiwan destination
question, relayed with the CV as an email attachment by `POST /api/profile` in the same Worker.
Spec: `docs/SPEC.md` §7.2, and §7.3 for the Taiwan route (Barry's brief,
6 Sep 2026). `npm test` covers both routes and all three wizard forks.

### Taste pass (2 Sep 2026)
Brand-lens review of every page: salary line restructured so amounts never wrap, `/for-employers`
services as a numbered list with one CTA card, copy trims on home and `/jobs`, gull added to the
wizard completion card (the permitted placements are listed in `components/Gull.tsx`).

### UI polish pass (6 Sep 2026)
Taste-plugin audit of every page at desktop and phone width, then the fixes, all within the
existing tokens: header lockup on one line at every width with a current-page marker
(`components/NavLink.tsx`) and a mobile menu that closes on Escape and outside tap; `Button`
pressed/hover states and one border box for both variants; two card recipes, a shared `field`
recipe and a `chip` as utilities in `globals.css` (documented on `/styleguide`); role title on
placement cards; styled filter selects, two per row on phones; the chart motif behind every
inner-page heading (`components/PageHeader.tsx`); balanced headings; footer link treatment
unified and two columns on phones; wizard progress bar and option states. Decision on the white
card surface in `DECISIONS.md`.

### Showcase pass — `/jobs` and `/jobs/[slug]` (6 Sep 2026)
Tom: the two pages still read as a job board. The index now browses by filter chip (country,
type of school) instead of a select-and-sort bar; cards are records — a "Filled" stamp beside
the kicker, location, role, then labelled facts (salary, what was included) and the month. The
placement page is a case record: stamp, story on the left, a fact file in the rail with the
salary as one fact, a single "roles like this" callout after the record, then three more
placements. Five titles that still said "needed" / "vacancies" / "required" were trimmed
(for Barry's glance, above). `stamp` and `fact-label` utilities in `globals.css`, shown on
`/styleguide`. Trade-offs in `DECISIONS.md`.

### Compact pass — `/for-employers` (7 Sep 2026)
Tom: the page ran too long. The seven services now sit in one row
(`components/ServiceMenu.tsx`), and the description of the service under the pointer shows
beneath the row; built as tabs so focus, tap and arrow keys reveal it too. Two columns on
phones, four from `sm`. Trade-off in `DECISIONS.md`.

### Moved to tickets (24 Oct 2026)
`PLAN.md` split: the spec into `docs/SPEC.md` (same § numbers, amendments folded in, voided text
kept in Appendix A), open work into nine GitHub issues and the Asana *Development tasks* project
(launch areas L1–L6), with the dependency chain through to cutover. `CLAUDE.md` now points at the
tickets. Decision in `DECISIONS.md`.
