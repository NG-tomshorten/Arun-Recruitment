## What and why

<!-- One or two sentences. Link the PLAN.md section or amendment this implements. -->

## Checks

- [ ] `npm run typecheck && npm run lint` clean
- [ ] `npm test` green (if `worker/` changed)
- [ ] `npm run verify` green (if a page, token, header or config changed)
- [ ] No new dependencies (CLAUDE.md guardrail 2), no secrets, nothing that stores personal data
- [ ] Copy comes from `site-capture.md` or a place PLAN.md allows fresh copy; British English
- [ ] `docs/STATUS.md` updated if this finishes a step; `docs/DECISIONS.md` if a trade-off was made
- [ ] Barry would not notice anything technical (no admin-facing jargon, slugs untouched)
