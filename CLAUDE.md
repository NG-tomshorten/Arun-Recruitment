# CLAUDE.md — how to work in this repo

Static rebuild of arunlanguagetraining.com for Barry Shorten's recruitment agency.
Next.js App Router · TypeScript · Tailwind v4 · TinaCMS · static export · one Cloudflare Worker ·
target £0/month. Product intent is in `README.md`.

This file is operating instructions only. Progress lives in `docs/STATUS.md` and trade-offs in
`docs/DECISIONS.md`, so this file should rarely change.

## Read before writing code

| File | What it is | When |
|---|---|---|
| `PLAN.md` | The spec: architecture, security, design, content model, build order. **Authoritative** — if anything here disagrees with PLAN.md, PLAN.md wins. Amendment blocks at the top override the sections they contradict. | Always. `grep -n '^#' PLAN.md`, then read the § for your task. |
| `docs/STATUS.md` | Where the build has got to, and what is next. | Start of every task. |
| `docs/DECISIONS.md` | Trade-offs already made and why. | Before changing build config, headers, dependencies, or anything commented as deliberate. |
| `site-capture.md` | Full crawl of the old site (1 Aug 2026). **The only source of copy and job data.** | Any task touching page text or the ten placements. |
| `brand/README.md` | Logo derivatives and the Futura licensing trap. | Logos, favicons, fonts. |
| `worker/README.md` | The form-relay Worker: local dev, curl examples, deploy steps. | Anything under `worker/`. |

## Commands and verification

```sh
npm run dev             # tinacms dev + next dev on :3000 — Tom usually has this running
npm run typecheck       # tsc --noEmit
npm run lint            # eslint
npm test                # Worker unit harness — keep it green
npm run check:contrast  # WCAG AA palette assertions
npm run verify          # full production build in a disposable git worktree
npm run build           # contrast gate + static export → out/ — see the rule below
```

- Before reporting any code change as done: `npm run typecheck && npm run lint`, plus `npm test`
  if `worker/` changed.
- Before reporting a page, token, header or config change as done: `npm run verify`.
- **Never run `npm run build` (or anything that touches `.next` or `tina/__generated__`) in the
  working tree while the dev server is running.** It 500s the dev site until a restart.
  `npm run verify` exists for exactly this; the reasons are in `docs/DECISIONS.md`.
- Report failures with the output, never "should work". If a check was skipped, say so.

## Working with Tom

- Tom commits from his editor, which auto-pushes `main`. **Do not commit, amend or push unless
  asked.** Leave changes in the working tree and say what changed.
- Finishing a build step or checkpoint: update `docs/STATUS.md` in the same change. Making a
  trade-off: add it to `docs/DECISIONS.md`. Never record either here.
- Ask before anything hard to reverse. Reversible changes that follow from the request: do them.

## The two users

Every decision resolves against these. Where they conflict, **Barry wins**.

- **Barry** — owner, non-technical, ~60s. Logs in, fills labelled fields, clicks save. Must never
  meet git, markdown, branches, PRs, deploys, or the word "commit".
- **Tom** — maintainer, unpaid, wants zero on-call. No server, no database, no backups. Safety
  comes from revertability, not gatekeeping.

## Conventions

- **British English** everywhere — copy, comments, `lang="en-GB"`. "Organisation", "programme", "£".
- **Design tokens only.** Colours, type sizes, radii and shadows come from `@theme` in
  `app/globals.css` (PLAN §11.1). Never a raw hex or an arbitrary `text-[17px]` in a component.
  New token ⇒ add it to `globals.css` and to `scripts/check-contrast.mjs` if it carries text.
- `brand-teal` is the logo teal — washes and fills only; it fails AA as text on light surfaces.
  `harbour` is its AA-passing counterpart for buttons and links.
- **Tabular figures** (`tnum`) wherever salary numbers appear.
- Components in `components/`, one named export per file, no default exports. `@/` path alias.
- Comments cite the spec section they implement (`// PLAN §11.3`, `// PLAN amendment 2 Sep 2026
  (profile)`).
- Motion: CSS-only, 150–200ms ease-out, always behind `prefers-reduced-motion`. The one ambient
  exception is the home page's sea scene (`components/Shore.tsx`, `components/Shoal.tsx`).
- The gull glyph (`components/Gull.tsx`) has a fixed list of permitted placements in its
  docblock. Never repeated, patterned or animated.
- Accessibility is not optional: semantic landmarks, visible focus, alt text, AA contrast.

## Guardrails — stop and ask before any of these

Numbered, because code comments cite them by number. Don't renumber.

1. **The ⛔ checkpoints in PLAN §13** (A: styleguide, B: Tina schema, C: pre-cutover). Show the
   work and wait. Don't build the next step through a checkpoint.
2. **New dependencies.** The tree is Next + React + Tailwind + Tina. Anything else — especially
   anything with a per-seat or per-request cost — gets flagged before install, never added
   silently. Dependency-free scripts are fine.
3. **Invented copy.** Page text comes from `site-capture.md`, or is written fresh only where
   PLAN §6 or an amendment allows it. Never the "Accredited by the Australian Government" claim.
   `/privacy` stays a verbatim port.
4. **Anything that stores personal data.** No database, no cookies, no analytics beyond the
   Cloudflare beacon, no cookie banner, no third-party asset hosts. The one sanctioned file input
   is the `/profile` CV, which the Worker relays as an email attachment and never stores.
5. **`dangerouslySetInnerHTML`.** Rich text renders through Tina's renderer.
6. **Secrets in the repo.** `.env*` and `worker/.dev.vars` are gitignored. Keys live in
   Cloudflare/TinaCloud env only.
7. **A server runtime.** `output: 'export'` stays: no `next start`, ISR, route handlers,
   middleware or runtime image optimisation. The Worker's form routes (PLAN §8.3) are the one
   exception and deploy separately.
8. **Renaming a job slug.** Slugs are permanent once created; renaming breaks inbound links.
9. **`@font-face` on the Futura TTF.** Desktop licence only (`brand/README.md`). Montserrat + Inter.
10. **Deleting a placement.** Hide with the `active` toggle; the URL stays live and noindexed.

## Where things live

```
app/            routes; app/globals.css holds every design token
components/     shared UI, one named export per file
content/jobs/   the placements, one file each — Tina-managed, slugs permanent
tina/           Tina schema; config.ts is the content model's source of truth
lib/            site constants, job helpers, rates.ts (GBP conversion, refreshed twice a year —
                never a field Barry fills in)
worker/         the Cloudflare form-relay Worker and its unit harness; deploys separately
scripts/        build gates and tools: contrast check, OG card source, verify-build
public/         static assets, _headers, _redirects, security.txt
brand/          source artwork, never served — derivatives live in public/images/
docs/           STATUS, DECISIONS; EDITING-GUIDE and MAINTENANCE land at step 10
site-capture.md the old site, captured
```
