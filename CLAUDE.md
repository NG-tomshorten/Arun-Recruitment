# CLAUDE.md — how to work in this repo

Static rebuild of arunlanguagetraining.com for Barry Shorten's recruitment agency.
Next.js App Router · TypeScript · Tailwind v4 · TinaCMS · static export · one Cloudflare Worker ·
target £0/month. Product intent is in `README.md`.

This file is operating instructions only. Open work lives in tickets ("Finding work" below), build
history in `docs/STATUS.md` and trade-offs in `docs/DECISIONS.md`, so this file should rarely
change.

## Read before writing code

| File | What it is | When |
|---|---|---|
| The ticket you're working on | The GitHub issue or Asana task: what, why, "Done when", and the files it touches. | Start of every task. See "Finding work". |
| `docs/SPEC.md` | The spec: architecture, routes, content model, forms, security, design, launch. **Authoritative**: if anything here disagrees with it, the spec wins. Appendix A is superseded text, kept for the record; never build from it. | Always. `grep -n '^#' docs/SPEC.md`, then read the § for your task. |
| `docs/STATUS.md` | Build history: what has been built so far. Not the to-do list. | When you need to know how something came to be. |
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
- Finishing a ticket: update it in the same session ("Finding work"). A meaningful piece landing
  also gets a short entry in `docs/STATUS.md`. Making a trade-off: add it to `docs/DECISIONS.md`.
  Never record status or progress here, and never as checkboxes in a `.md` file.
- Ask before anything hard to reverse. Reversible changes that follow from the request: do them.

## Finding work

Open work lives in two ticket systems, never in a `.md` file. **A change to files in this repo is
a GitHub issue; anything done in a dashboard, an account, DNS, or by Barry is an Asana task.**
Where one waits on the other, each names the other (the issue number, or the task's name).

**GitHub issues — code** (`NG-tomshorten/Arun-Recruitment`):

- `gh issue list` for the queue; `gh issue view <n>` for one. Take `launch blocker` issues first.
- `decision required`: the issue names who decides (Tom or Barry). Don't write code until their
  answer is recorded on the issue.
- Each issue follows the templates in `.github/ISSUE_TEMPLATE/`: Type, What is happening (facts
  from the code, with `file:line`), Change, Done when, Related, not in scope. Write new ones the
  same way, and verify claims against the code before filing.
- When you finish one, tick the Change and Done-when boxes that are now true and comment with
  what changed and what's left. Tom commits and closes; suggest `Fixes #n` in the commit message.
  Don't close an issue whose "Done when" isn't met.

**Asana — infrastructure, accounts, Barry, launch**: Client Projects → *Arun Language Training* →
**Development tasks** project (portfolio GID `1219859901478288`, project GID
`1219859901478292`). Read and update it with the Asana MCP tools.

- Sections: Launch blockers (L1–L6) `1219859901478293` · Post-launch `1219863948380408` ·
  Icebox `1219844664217586`. Launch areas: L1 accounts & security · L2 Cloudflare deploy ·
  L3 email & DNS · L4 TinaCloud · L5 Barry's sign-offs · L6 cutover.
- Every task has What / Why / Done when / Context notes, Priority and Status, and is assigned
  to Tom. New tasks go in this project **and** a section (pass `project_id` + `section_id`,
  subtasks too, or they never show on the board), and follow the same shape.
- Completing one: only when its "Done when" is observed, not just configured. If it's partial,
  tick the finished subtasks, set Status (In progress / In Review / Blocked by client) and add a
  dated comment saying what's left.
- If the Asana or GitHub tools aren't connected, don't skip the update: say in your final report
  which ticket and what to change, so Tom can make it.

## The two users

Every decision resolves against these. Where they conflict, **Barry wins**.

- **Barry** — owner, non-technical, ~60s. Logs in, fills labelled fields, clicks save. Must never
  meet git, markdown, branches, PRs, deploys, or the word "commit".
- **Tom** — maintainer, unpaid, wants zero on-call. No server, no database, no backups. Safety
  comes from revertability, not gatekeeping.

## Conventions

- **British English** everywhere — copy, comments, `lang="en-GB"`. "Organisation", "programme", "£".
- **Design tokens only.** Colours, type sizes, radii and shadows come from `@theme` in
  `app/globals.css` (SPEC §11.1). Never a raw hex or an arbitrary `text-[17px]` in a component.
  New token ⇒ add it to `globals.css` and to `scripts/check-contrast.mjs` if it carries text.
- `brand-teal` is the logo teal — washes and fills only; it fails AA as text on light surfaces.
  `harbour` is its AA-passing counterpart for buttons and links.
- **Tabular figures** (`tnum`) wherever salary numbers appear.
- Components in `components/`, one named export per file, no default exports. `@/` path alias.
- Comments cite the spec section they implement (`// SPEC §11.3`, `// SPEC §7.2`).
- Motion: CSS-only, 150–200ms ease-out, always behind `prefers-reduced-motion`. The one ambient
  exception is the home page's sea scene (`components/Shore.tsx`, `components/Shoal.tsx`).
- The gull glyph (`components/Gull.tsx`) has a fixed list of permitted placements in its
  docblock. Never repeated, patterned or animated.
- Accessibility is not optional: semantic landmarks, visible focus, alt text, AA contrast.

## Guardrails — stop and ask before any of these

Numbered, because code comments cite them by number. Don't renumber.

1. **The ⛔ checkpoints in SPEC §13** (A: styleguide and B: Tina schema, both closed; C:
   pre-cutover, open). Show the work and wait. Don't build the next step through a checkpoint.
2. **New dependencies.** The tree is Next + React + Tailwind + Tina. Anything else — especially
   anything with a per-seat or per-request cost — gets flagged before install, never added
   silently. Dependency-free scripts are fine.
3. **Invented copy.** Page text comes from `site-capture.md`, or is written fresh only where
   SPEC §6 or §7 allows it. Never the "Accredited by the Australian Government" claim.
   `/privacy` stays a verbatim port.
4. **Anything that stores personal data.** No database, no cookies, no analytics beyond the
   Cloudflare beacon, no cookie banner, no third-party asset hosts. The one sanctioned file input
   is the `/profile` CV, which the Worker relays as an email attachment and never stores.
5. **`dangerouslySetInnerHTML`.** Rich text renders through Tina's renderer.
6. **Secrets in the repo.** `.env*` and `worker/.dev.vars` are gitignored. Keys live in
   Cloudflare/TinaCloud env only.
7. **A server runtime.** `output: 'export'` stays: no `next start`, ISR, route handlers,
   middleware or runtime image optimisation. The Worker's form routes (SPEC §8.3) are the one
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
docs/           SPEC, STATUS (history), DECISIONS; EDITING-GUIDE and MAINTENANCE are issues #6, #5
site-capture.md the old site, captured
```
