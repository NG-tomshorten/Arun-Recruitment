# CLAUDE.md — operating instructions

Static rebuild of arunlanguagetraining.com for Barry Shorten's recruitment agency.
Next.js App Router · TypeScript · Tailwind v4 · static export · target £0/month.

## Read before writing code

| File | What it is | When |
|---|---|---|
| `PLAN.md` | The spec. Architecture, security, design, content model, build order. **Authoritative** — if this file and PLAN.md disagree, PLAN.md wins. | Always. Read the § that covers your task. |
| `site-capture.md` | Full crawl of the live site (1 Aug 2026). **The only source of copy and job data.** | Any task touching page text or the ten listings. |
| `brand/README.md` | Logo derivatives + the Futura licensing trap. | Any task touching logos, favicons or fonts. |

Don't read all of PLAN.md every time — `grep -n '^#' PLAN.md` and read the relevant section.

## Where the build is

**Steps 1–3 of PLAN §13 are done.** Step 1: scaffold, design tokens, layout shell, gull, chart
motif, tide line, `/styleguide`, plus Barry's brand media pack. Checkpoint A closed — Barry chose
Montserrat (PLAN §11.2). Step 2: `tina/config.ts` schema, the ten listings in `content/jobs/`,
local mode (`npm run dev` = `tinacms dev`); `/privacy`, `app/not-found.tsx` and
`public/_redirects` landed alongside. Checkpoint B closed (1 Sep 2026) — full Barry walkthrough
in the admin: create, slug lock, no delete/rename, edit round-trip all verified. Step 3: `/jobs`
index (filters/sort/URL params) and `/jobs/[slug]` (apply panel, JobPosting JSON-LD, filled
state, TEFL cross-link), consuming Tina's generated client/types. Hard-won build knowledge, do
not undo: the `build` script must force `NODE_ENV=production` on the inner `next build` (the
tinacms CLI exports `development`, which crashes prerendering) and must clear `.next` and
`tina/__generated__/.cache` + pass `--no-client-build-cache` (two cache layers otherwise serve
stale job content into a fresh build — a Barry edit that never ships). While Tom's `npm run dev`
is running, NEVER run `npm run build` (or any `.next`/`tina/__generated__` mutation) in the
working tree — it deletes manifests out from under the dev server and rewrites the generated
Tina client onto the build's port, 500ing the site until a restart. Run verification builds in
a disposable `git worktree` on ports 4002/9002, with `node_modules` cloned in via
`cp -Rc` (APFS copy-on-write, ~15s) — NOT symlinked; Turbopack refuses a node_modules
symlink that points outside its root.
Step 4: home content (three newest role cards, credibility block from capture §2.1, TEFL nudge
on the channel deep-end), `/for-employers` (seven services + fresh one-liners, Barry's email
CTA), `/tefl-course` (ITTT affiliate link, `rel="sponsored"`, no Australian-government claim).
Step 5: `/contact` (form + plain details; form hidden until hydration, `<noscript>` mailto) and
the Worker contact route in `worker/` (full §8.3 stack: origin check, honeypot, time-trap,
validation + CRLF strip, Turnstile, Resend relay; unit harness `node worker/test-worker.mjs`
covers every branch — keep it green). The Worker deploys separately (`worker/README.md`);
Turnstile runs on Cloudflare's published test keys until real keys land at deploy. `/privacy`
and 404 were already done in Step 2.
**Pivot (2 Sep 2026, from Barry — recorded as the amendment block at the top of PLAN.md, which
overrides the sections it contradicts):** the ten listings were already-filled roles, so `/jobs`
is now a record of placements, not a job board — no apply flows, no JobPosting JSON-LD (which
also removed the site's only `dangerouslySetInnerHTML`), dates shown as month + year only,
`active` now just hides a placement from the lists; and `/tefl-course` is deleted entirely
(stale affiliate) with its legacy redirect re-pointed at `/`. Teacher CTAs go to `/contact` /
mailto. Tina schema: collection relabelled Placements, `closingDate` field dropped (no content
used it), `postedDate` relabelled as the fill date. The home page was then reverted to the
minimal Checkpoint-A shape (hero fork + sea only, no content fetch) — Barry and Tom both prefer
the near-empty landing; don't re-add sections to it without being asked.
Step 6: `sitemap.ts` (excludes hidden placements, /styleguide, /admin), `robots.ts`
(disallows /admin), root-layout metadata (metadataBase, OG defaults, twitter card), ONE static
OG card for all pages — `public/images/og.png`, regenerated from `scripts/og-card.html`
(deliberate simplification: no satori/sharp, no per-placement images), apple-icon + manifest
icons via sips from `app/icon.png`, and the Cloudflare beacon in the layout (dormant until
`NEXT_PUBLIC_CF_BEACON_TOKEN` is set at deploy). Redirects were already done in Step 2.
**Next: Step 7 — security + quality pass: `_headers` + CSP hash generator, `security.txt`,
axe run, Lighthouse 95+ on all four categories, `npm audit` clean-or-justified.**

Update this section in the same commit that finishes a step. It is the only state in this file
that goes stale.

## Commands

```sh
npm run dev             # local dev server
npm run typecheck       # tsc --noEmit
npm run lint            # eslint
npm run check:contrast  # WCAG AA palette assertions
npm run build           # contrast gate + static export → out/
```

Before reporting any code change as done: `npm run typecheck && npm run lint`.
Before reporting a page or token change as done: `npm run build` (it runs the contrast gate).
Report failures with the output — never "should work".

## The two users

Every decision resolves against these. Where they conflict, **Barry wins**.

- **Barry** — owner, non-technical, ~60s. Logs in, fills labelled fields, clicks save. Must never
  meet git, markdown, branches, PRs, deploys, or the word "commit".
- **Tom** — maintainer, unpaid, wants zero on-call. No server, no database, no backups. Safety
  comes from revertability, not gatekeeping.

## Conventions

- **British English** everywhere — copy, comments, `lang="en-GB"`. "Organisation", "programme", "£".
- **Design tokens only.** Colours, type sizes, radii and shadows come from `@theme` in
  `app/globals.css` (PLAN §11.1). Never a raw hex or arbitrary `text-[17px]` in a component.
  New token ⇒ add it to `globals.css` and to `scripts/check-contrast.mjs` if it carries text.
- `brand-teal` `#8CC1C7` is the logo teal — washes and fills only, it fails AA as text on light.
  `harbour` is its AA-passing counterpart for buttons and links.
- **Tabular figures** (`tabular-nums`) wherever salary numbers appear.
- Components in `components/`, one export per file, named export, no default exports.
- `@/` path alias for imports. Comments cite the spec section they implement (`// PLAN §11.3`).
- Motion: CSS-only, 150–200ms ease-out, always behind `prefers-reduced-motion`. The one ambient
  exception is the home page's sea scene — shore drift (`components/Shore.tsx`) and the shoal
  (`components/Shoal.tsx`) — don't add others.
- Accessibility is not optional: semantic landmarks, visible focus, alt text, AA contrast.

## Guardrails — do not do these without stopping and asking first

1. **Stop at the ⛔ checkpoints in PLAN §13** (A: styleguide, B: Tina schema, C: pre-cutover).
   Show the work and wait. Don't build the next step through a checkpoint.
2. **No new dependencies.** The tree is Next + React + Tailwind, plus Tina and satori/sharp when
   those steps land. Anything else — including anything with a per-seat or per-request cost —
   gets flagged before install, never added silently.
3. **No invented copy.** Page text comes from `site-capture.md` or is written fresh only where the
   plan says so (§6). Never carry over the "Accredited by the Australian Government" claim.
   Fix the live "Servcices" typo; port `/privacy` verbatim.
4. **Nothing that stores personal data.** No CV uploads, no file inputs, no database, no cookies,
   no analytics beyond the Cloudflare beacon, no cookie banner, no third-party asset hosts.
5. **No `dangerouslySetInnerHTML`.** Rich text renders through Tina's renderer.
6. **No secrets in the repo.** `.env*` is gitignored. Keys live in Cloudflare/TinaCloud env only.
7. **No server runtime.** `output: 'export'` stays. Nothing that needs `next start`, ISR, route
   handlers, middleware, or runtime image optimization. The one exception is the Cloudflare Worker
   contact route (PLAN §8.3), which is separate from the site build.
8. **Job slugs are permanent once created.** Renaming one breaks inbound links.
9. **Never `@font-face` the Futura TTF** — desktop licence only (`brand/README.md`). Montserrat + Inter.
10. **Hide placements with the `active` toggle, never by deleting.** Inactive placements keep
    their URL (noindexed) but leave the index and home page.

## Where things live

```
app/            routes; globals.css holds every design token
components/     shared UI (Button, Header, Footer, MobileNav, Gull, ChartMotif, TideLine)
lib/rates.ts    GBP conversion, refreshed twice a year — never a field Barry fills in
scripts/        build-time gates (contrast now; CSP hashes and OG images later)
brand/          source artwork, never served — derivatives live in public/images/
site-capture.md the old site, captured
```
