# Form relay Worker

Two routes in one Worker (PLAN §8.3; the profile route was added by PLAN
amendment 2 Sep 2026 (profile)):

- `POST /api/contact` — relays the `/contact` enquiry form.
- `POST /api/profile` — relays the `/profile` Teacher Profile wizard,
  with the candidate's CV as an email attachment. The wizard forks on a
  China/Taiwan destination question, and validation follows three blocks:
  every route (passport, `doc_background_check` + `check_recent`,
  `background_check`), the China set (`destination=china` or `either`:
  locations, job types, salary, apostille, teaching certificate) and the
  Taiwan set (`destination=taiwan` or `either`: `degree_on_campus`,
  `age_groups`). Fields from the other set are ignored, not rejected.

Both deliver to `info@arunlanguagetraining.com` via Resend. Stores nothing;
logs outcome and timestamp only — the CV is forgotten the moment Resend
accepts it. This directory deploys separately from the static site — it is
not part of `npm run build`. (The Worker keeps its original `arun-contact`
name; renaming a deployed Worker is churn.)

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
  (`1x00000000000000000000AA`) is the forms' default when
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset, so the forms and Worker pass
  Turnstile together locally with no real keys.
- `worker/.dev.vars` is gitignored. Real sends need a real
  `RESEND_API_KEY`; with the placeholder, Resend returns 401 and the
  Worker answers 502, which exercises each form's error + mailto-fallback
  path.
- The dev server listens on http://localhost:8787; the forms post to the
  relative paths `/api/contact` and `/api/profile`, so to drive them from
  `next dev` either proxy or test the Worker directly with curl:

```sh
curl -i -X POST http://localhost:8787/api/contact \
  -H "Origin: https://www.arunlanguagetraining.com" \
  --data-urlencode "name=Test Person" \
  --data-urlencode "email=test@example.com" \
  --data-urlencode "message=Hello" \
  --data-urlencode "form_started_at=$(( $(date +%s) * 1000 - 10000 ))" \
  --data-urlencode "cf-turnstile-response=test"
```

```sh
curl -i -X POST http://localhost:8787/api/profile \
  -H "Origin: https://www.arunlanguagetraining.com" \
  -F "destination=china" \
  -F "locations=Chengdu or Kunming" \
  -F "any_location=" \
  -F "job_types=training_centre" \
  -F "job_types=university" \
  -F "salary_rmb=25000" \
  -F "doc_degree_apostille=in_progress" \
  -F "doc_teaching_certificate=done" \
  -F "doc_background_check=not_started" \
  -F "passport_country=uk" \
  -F "passport_expiry_month=06" \
  -F "passport_expiry_year=2029" \
  -F "background_check=clean" \
  -F "check_recent=" \
  -F "name=Test Person" \
  -F "email=test@example.com" \
  -F "cv=@cv.pdf" \
  -F "form_started_at=$(( $(date +%s) * 1000 - 10000 ))" \
  -F "cf-turnstile-response=test"
```

A Taiwan submission (`check_recent` is required only when the check is
`done`, and must be empty otherwise):

```sh
curl -i -X POST http://localhost:8787/api/profile \
  -H "Origin: https://www.arunlanguagetraining.com" \
  -F "destination=taiwan" \
  -F "degree_on_campus=yes" \
  -F "age_groups=any_3_16" \
  -F "passport_country=uk" \
  -F "passport_expiry_month=06" \
  -F "passport_expiry_year=2029" \
  -F "doc_background_check=done" \
  -F "check_recent=yes" \
  -F "background_check=clean" \
  -F "name=Test Person" \
  -F "email=test@example.com" \
  -F "cv=@cv.pdf" \
  -F "form_started_at=$(( $(date +%s) * 1000 - 10000 ))" \
  -F "cf-turnstile-response=test"
```

There is also a dependency-free unit harness: `node worker/test-worker.mjs`
runs the fetch handler in Node with Turnstile/Resend stubbed and asserts
every branch of both routes.

## Deploy (PLAN §13 step 8 — not before)

1. `npx wrangler deploy` from this directory (Cloudflare account with the zone).
2. Uncomment both routes in `wrangler.toml` once DNS is in the account.
3. `npx wrangler secret put TURNSTILE_SECRET_KEY` (real key, from the
   Turnstile widget created for www.arunlanguagetraining.com).
4. `npx wrangler secret put RESEND_API_KEY` (send-only key; domain
   `send.arunlanguagetraining.com` must be verified in Resend first — §8.4).
5. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (the real site key) in the site's
   build environment and rebuild.
6. Dashboard: zone rate-limiting rule on `POST /api/*`, 5 req/min/IP
   (covers both routes).
7. Confirm attachments are enabled on the Resend plan in use (the profile
   route sends the CV as a base64 attachment, up to ~6.7 MB encoded — well
   inside Resend's 40 MB message cap, but check the plan allows attachments
   at all before go-live).
