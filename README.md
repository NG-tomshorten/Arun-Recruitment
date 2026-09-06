# Arun Language Training & Recruitment

Static rebuild of [arunlanguagetraining.com](https://arunlanguagetraining.com) — a small West
Sussex agency that places British and Commonwealth graduates into English-teaching jobs in
Taiwan and mainland China, and finds instructors for the schools, colleges and companies that
need them.

## What the site does

- Shows the placements the agency has made (`/jobs`), as a record of the work — not a job board.
- Lets a teacher send a profile and CV (`/profile`) or an enquiry (`/contact`) straight to the
  owner's inbox, via one Cloudflare Worker that relays email and stores nothing.
- Tells employers what the agency offers (`/for-employers`).
- Lets the owner edit placements himself through TinaCMS, with git as the only storage.

Two people matter. **Barry** owns the business, is non-technical, and edits content through a
form. **Tom** maintains the site, unpaid, and wants nothing to run, break or need a login at
3 a.m. Every design decision resolves against those two; where they conflict, Barry wins.

## Stack

Next.js (App Router, static export) · TypeScript · Tailwind v4 · TinaCMS (git-backed content) ·
one Cloudflare Worker for the two forms. No server runtime, no database, no stored personal
data, no cookies. Target running cost: £0/month.

## Where to read

| File | What it is |
|---|---|
| [`PLAN.md`](PLAN.md) | The spec: architecture, security, design, content model, build order. Amendments at the top override the sections they contradict. |
| [`docs/STATUS.md`](docs/STATUS.md) | Where the build has got to and what is next. |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Engineering trade-offs already made, and why. |
| [`CLAUDE.md`](CLAUDE.md) | How to work in this repo: conventions, guardrails, verification. Written for Claude Code, useful for people. |
| [`site-capture.md`](site-capture.md) | Full capture of the old site (1 Aug 2026); the only source of copy and job data. |
| [`worker/README.md`](worker/README.md) | The form-relay Worker: local dev, curl examples, deploy steps. |
| [`brand/README.md`](brand/README.md) | Logo derivatives and the Futura licensing trap. |

`docs/EDITING-GUIDE.md` (for Barry) and `docs/MAINTENANCE.md` (for Tom) land at build step 10.

## Commands

```sh
npm run dev             # tinacms dev + next dev on http://localhost:3000
npm run typecheck       # tsc --noEmit
npm run lint            # eslint
npm test                # Worker unit harness — the behavioural spec for both form routes
npm run check:contrast  # WCAG AA palette assertions
npm run verify          # full production build in a disposable git worktree
npm run build           # contrast gate + static export → out/ (not while dev is running)
```

`/styleguide` (dev-only, noindexed) shows the design tokens, type scale and components.

## Tests

The Worker's behaviour is specified by `worker/test-worker.mjs`: every hardening branch of both
routes and all three wizard forks, with Turnstile and Resend stubbed, no dependencies. The site
itself is verified by the type checker, the contrast gate inside the build, and Lighthouse runs
recorded in `docs/STATUS.md`.
