# Arun Language Training & Recruitment

Static site rebuild for [arunlanguagetraining.com](https://arunlanguagetraining.com) — a West Sussex agency placing British and Commonwealth graduates into English-teaching jobs in Taiwan and mainland China.

- **[PLAN.md](PLAN.md)** — the implementation plan (architecture, security, design, build order). Read this first.
- **[site-capture.md](site-capture.md)** — full capture of the live site (1 Aug 2026); source of truth for all copy and data.

## Stack

Next.js (App Router, static export) · TypeScript · Tailwind CSS · TinaCMS (git-backed content) · Cloudflare Workers static assets. No server runtime, no database, no stored personal data. Target running cost: £0/month.

## Commands

```sh
npm run dev             # local dev server
npm run build           # contrast gate + static build → out/
npm run check:contrast  # WCAG AA palette assertions on their own
npm run lint            # eslint
npm run typecheck       # tsc --noEmit
```

`/styleguide` (dev-only, noindexed) shows the design tokens, type scale and components.

Editor and maintainer documentation lands in `docs/` at build step 10 (see PLAN.md §12–13).
