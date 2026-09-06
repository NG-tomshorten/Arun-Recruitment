# Build status

Where the build has got to against the order in PLAN.md §13, and what is next. This is the
only place progress is recorded: update it in the same change that finishes a step or a
checkpoint, and keep entries short — the code, the commit history and PLAN.md carry the detail.
Trade-offs go in `DECISIONS.md`, not here.

**Next: Step 8 — deploy.** Cloudflare (Workers Builds from the repo, fallback Pages), custom
domain, Full (strict) TLS, zone settings (PLAN §8.5), real Turnstile + Resend keys, DMARC
`p=none`, rate-limit rule on `POST /api/*` (5 req/min/IP), Web Analytics beacon token, CI
workflow + Dependabot. **Blocked on Tom's accounts.** Deploy-time items queued so far:

- Worker: second route `/api/profile` in `wrangler.toml`, confirm the Resend plan allows
  attachments (`worker/README.md`).
- Site: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `NEXT_PUBLIC_CF_BEACON_TOKEN` in the build env.
- Barry to glance at the reworded home lead and `/jobs` intro (taste pass), and confirm whether
  South African passports qualify for Taiwan (Taiwan question set).

## Done

### Step 1 — scaffold + design system (1 Aug 2026)
Scaffold, design tokens, layout shell, gull, chart motif, tide line, `/styleguide`, Barry's brand
media pack. **Checkpoint A closed:** Barry chose Montserrat from eleven candidates (PLAN §11.2).

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
Form hidden until hydration with a `<noscript>` mailto; `worker/` implements the full PLAN §8.3
stack (origin check, honeypot, time-trap, validation + CRLF strip, Turnstile, Resend relay).
`npm test` runs the unit harness that covers every branch.

### Pivot — placements, not a job board (2 Sep 2026)
Barry: the ten listings were already-filled roles. `/jobs` is now a record of placements
(no apply flows, no JobPosting JSON-LD, month + year dates, `active` only hides); `/tefl-course`
deleted, its legacy redirect re-pointed at `/`; teacher CTAs go to `/contact` and mailto.
Recorded as the first amendment block at the top of PLAN.md. The home page was then reverted
to the minimal Checkpoint-A shape (hero fork + sea scene, no content fetch).

### Step 6 — sitemap, robots, metadata, OG, icons, beacon (2 Sep 2026)
`sitemap.ts` (excludes hidden placements, `/styleguide`, `/admin`), `robots.ts`, root-layout
metadata, one static OG card (`public/images/og.png` from `scripts/og-card.html`), apple-icon and
manifest icons, Cloudflare beacon in the layout (dormant until the token is set).

### Step 7 — security + quality pass (2 Sep 2026)
`public/_headers` (PLAN §8.2 suite; CSP trade-off in `DECISIONS.md`), `security.txt`,
dependency audit (next bumped, `qs` pinned, five moderates accepted — see `DECISIONS.md`).
Lighthouse: `/` 96/100/100/100, `/jobs` 99/100/100/100, placement page 97/100/100/100.

### Teacher Profile wizard — `/profile` (2 Sep 2026; Taiwan set 6 Sep 2026)
Client-side wizard in `components/ProfileWizard.tsx`, forking on a China/Taiwan destination
question, relayed with the CV as an email attachment by `POST /api/profile` in the same Worker.
Spec: the second amendment block in PLAN.md, including its Taiwan addendum (Barry's brief,
6 Sep 2026). `npm test` covers both routes and all three wizard forks.

### Taste pass (2 Sep 2026)
Brand-lens review of every page: salary line restructured so amounts never wrap, `/for-employers`
services as a numbered list with one CTA card, copy trims on home and `/jobs`, gull added to the
wizard completion card (the permitted placements are listed in `components/Gull.tsx`).

## Not started

- **Step 8 — deploy.** See the top of this file.
- **Step 9 — TinaCloud.** Connect, editorial workflow off, invite Barry, test the whole Barry loop
  for real (PLAN §13).
- **Step 10 — docs + launch.** `docs/EDITING-GUIDE.md` (Barry) and `docs/MAINTENANCE.md` (Tom)
  per PLAN §12 — the accepted audit moderates and the CSP fallback need recording there; then
  **⛔ Checkpoint C** and cutover.
