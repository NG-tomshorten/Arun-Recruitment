## What and why

<!-- One or two sentences. Link the issue ("Fixes #n") and the docs/SPEC.md section this implements. -->

## Checks

- [ ] `npm run typecheck && npm run lint` clean
- [ ] `npm test` green (if `worker/` changed)
- [ ] `npm run verify` green (if a page, token, header or config changed)
- [ ] No new dependencies (CLAUDE.md guardrail 2), no secrets, nothing that stores personal data
- [ ] Copy comes from `site-capture.md` or a place docs/SPEC.md allows fresh copy; British English
- [ ] Issue's "Done when" met (or what's left noted on it); `docs/DECISIONS.md` if a trade-off was made
- [ ] Barry would not notice anything technical (no admin-facing jargon, slugs untouched)
