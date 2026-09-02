# Contact relay Worker

The `POST /api/contact` route (PLAN §8.3). Relays the `/contact` enquiry form
to `info@arunlanguagetraining.com` via Resend. Stores nothing; logs outcome
and timestamp only. This directory deploys separately from the static site —
it is not part of `npm run build`.

## Local development

`wrangler` is deliberately **not** a dependency of this repo (CLAUDE.md
guardrail 2) — run it with npx when needed:

```sh
cd worker
echo "TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA" >  .dev.vars
echo "RESEND_API_KEY=re_test_placeholder"                       >> .dev.vars
npx wrangler dev
```

- `1x0000000000000000000000000000000AA` is Cloudflare's published Turnstile
  **test secret** — it approves any token. The matching test site key
  (`1x00000000000000000000AA`) is the form's default when
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset, so the form and Worker pass
  Turnstile together locally with no real keys.
- `worker/.dev.vars` is gitignored. Real sends need a real
  `RESEND_API_KEY`; with the placeholder, Resend returns 401 and the
  Worker answers 502, which exercises the form's error + mailto-fallback
  path.
- The dev server listens on http://localhost:8787; the form posts to the
  relative path `/api/contact`, so to drive it from `next dev` either proxy
  or test the Worker directly with curl:

```sh
curl -i -X POST http://localhost:8787 \
  -H "Origin: https://www.arunlanguagetraining.com" \
  --data-urlencode "name=Test Person" \
  --data-urlencode "email=test@example.com" \
  --data-urlencode "message=Hello" \
  --data-urlencode "form_started_at=$(( $(date +%s) * 1000 - 10000 ))" \
  --data-urlencode "cf-turnstile-response=test"
```

There is also a dependency-free unit harness: `node worker/test-worker.mjs`
runs the fetch handler in Node with Turnstile/Resend stubbed and asserts
every §8.3 branch.

## Deploy (PLAN §13 step 8 — not before)

1. `npx wrangler deploy` from this directory (Cloudflare account with the zone).
2. Uncomment the route in `wrangler.toml` once DNS is in the account.
3. `npx wrangler secret put TURNSTILE_SECRET_KEY` (real key, from the
   Turnstile widget created for www.arunlanguagetraining.com).
4. `npx wrangler secret put RESEND_API_KEY` (send-only key; domain
   `send.arunlanguagetraining.com` must be verified in Resend first — §8.4).
5. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (the real site key) in the site's
   build environment and rebuild.
6. Dashboard: zone rate-limiting rule on `POST /api/contact`, 5 req/min/IP.
