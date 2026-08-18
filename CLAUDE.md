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

**Step 1 of PLAN §13 is done** (scaffold, design tokens, layout shell, gull, chart motif,
tide line, `/styleguide`), plus Barry's brand media pack. Checkpoint A is the live question.
**Next: Step 2 — `tina/config.ts` schema + the ten listings, local mode.**

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
- Motion: CSS-only, 150–200ms ease-out, always behind `prefers-reduced-motion`.
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
8. **Job slugs are permanent once created.** Renaming one breaks Google Jobs and inbound links.
9. **Never `@font-face` the Futura TTF** — desktop licence only (`brand/README.md`). Fraunces + Inter.
10. **Retire jobs with the `active` toggle, never by deleting.** Inactive jobs keep their URL and
    render a "role has been filled" state.

## Where things live

```
app/            routes; globals.css holds every design token
components/     shared UI (Button, Header, Footer, MobileNav, Gull, ChartMotif, TideLine)
lib/rates.ts    GBP conversion, refreshed twice a year — never a field Barry fills in
scripts/        build-time gates (contrast now; CSP hashes and OG images later)
brand/          source artwork, never served — derivatives live in public/images/
site-capture.md the old site, captured
```
