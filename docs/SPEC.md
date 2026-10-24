# Arun Language Training & Recruitment — specification

What the site is and how it must behave. It doesn't track progress or open work: the work lives in
GitHub issues (code) and in Asana (infrastructure, accounts, Barry's sign-offs, launch). See
`CLAUDE.md`, "Finding work". Trade-offs made while building are in `docs/DECISIONS.md`. Build
history is in `docs/STATUS.md`.

`site-capture.md` is the source of truth for all copy and data. It was built on 1 Aug 2026 from a
full crawl of the live site, including content hidden in HTML comments. "Capture §n" points into
that file.

**History.** This file was `PLAN.md`, the implementation plan (1 Aug 2026), plus the amendments
of 2 Sep 2026 (the placements pivot, and the Teacher Profile) and 6 Sep 2026 (the Taiwan route).
On 24 Oct 2026 the plan was split: the amendments were folded into the sections below, the build
order became tickets, and the text the pivot voided was kept, verbatim, in Appendix A. The §
numbers are unchanged, so a `SPEC §n` citation means what `PLAN §n` did. The last version of
`PLAN.md` is in git at commit `2527864`.

---

## 1. Architecture (decisions locked)

- **Next.js (App Router), TypeScript, Tailwind CSS**, British English (`lang="en-GB"`) throughout.
- **Fully static output**: `output: 'export'` in `next.config`. No Next server runtime exists in production, so there is no request-time framework surface to attack or patch. Verified working with TinaCMS + App Router (Tina's admin builds to static files; content is read at build time; see §10).
- **TinaCMS**: git-backed content, no database, no custom admin, no custom auth. Content as MDX in `content/`, schema in `tina/config.ts`. `tinacms build` runs **before** `next build`.
- **Deployed to Cloudflare Workers with static assets, via Workers Builds git integration** (push → build → live). Cloudflare has put Pages into maintenance mode and directs new projects to Workers with static assets, which serves `_headers`/`_redirects` files the same way. If Workers Builds fights during setup, plain Cloudflare Pages is the accepted fallback: same repo, same files, same £0.
- **The only dynamic code in production is the form-relay Worker** (`worker/`, deployed separately): `POST /api/contact` (§7.1) and `POST /api/profile` (§7.2). A form outage can never take the site down, and the site can never take the forms down.
- **No client-side JS except:** the `/jobs` filter chips, mobile nav, the `/for-employers` service menu (tabs), the contact form submit + Turnstile widget, the `/profile` wizard, the Cloudflare Web Analytics beacon, and Tina's `/admin` SPA. Everything else is static HTML/CSS. CSS-only animation is fine.
- **No cookies, no stored personal data, no third-party asset services.** Fonts self-hosted via `next/font`. (Turnstile is Cloudflare's cookieless CAPTCHA. Verify the no-cookie claim on the live site; if any cookie appears, drop Turnstile and rely on the honeypot stack, see §8 and §14.2.)
- `images: { unoptimized: true }` (image optimisation doesn't run under static export). The site ships almost no raster images at launch; anything added is pre-sized, compressed and committed. No `/api/og` route; see §9 for OG images.

### Running cost

| Service | Tier | Cost |
|---|---|---|
| Cloudflare Workers/Pages + Web Analytics + Turnstile | Free | £0 |
| TinaCloud (verified Aug 2026: free tier = 2 users, managed git, media) | Free | £0 |
| Resend (form email; 100/day free; the plan must allow attachments for §7.2) | Free | £0 |
| GitHub | Free | £0 |
| Domain renewal (already owned) | — | ~£10–15/yr |

Target: **£0/month**. Do not introduce anything with a per-seat or per-request cost without flagging it first.

---

## 2. The business

A small West Sussex recruitment agency placing British and Commonwealth graduates into English-teaching jobs in Taiwan and mainland China. Two distinct audiences: **teachers** looking for a placement, and **employers** (schools, colleges, companies) who need instructors. (It also earned affiliate revenue on a $249 online TEFL/TESOL certificate (ITTT, code `LNMSR2017C`). That arrangement is stale and was dropped from the site on 2 Sep 2026; see §6 and Appendix A.)

Tone: warm, plainspoken, credible. A real person in Littlehampton who will answer your email, not a faceless job board. No recruitment-industry filler ("synergies", "solutions", "world-class"). Note the old site's H1 said "Language Training in Littlehampton", which is the wrong positioning; the new site leads with recruitment. Fix the old "Servcices" typo. Do **not** carry over the "Accredited by the Australian Government" claim from the old TEFL page (it belongs to a retired partnership that is commented out in the old HTML; capture §1/§2.3).

## 3. Two users, two very different needs

Design every decision around these two roles. Where they conflict, the owner wins.

**Barry (owner, non-technical, ~60s).** Needs to add a placement, edit a detail, and hide a placement. Must never encounter: git, GitHub, markdown syntax, a deploy button, a branch, a pull request, or the word "commit". He logs in with an email address and a password, fills in labelled form fields, and clicks save.

**Tom (maintainer, technical, unpaid, wants to stay that way).** Zero on-call burden. No server to patch, no database to back up, no TLS to renew. Every content change is a git commit, so any mistake is a one-line revert. If Tom disappears for six months, the site keeps working and Barry keeps publishing.

---

## 4. Routes & redirects

```
/                    Home — split path for teachers vs employers
/jobs                Placements we've filled — browsable record (not a job board)
/jobs/[slug]         One page per placement (10 at launch, slugs in capture §3)
/for-employers       Employer services
/contact             Contact + enquiry form
/profile             Teacher Profile wizard (§7.2)
/privacy             Privacy policy (same path as old site — no redirect needed)
/admin               TinaCMS admin (generated by Tina, not hand-built)
/404                 Custom not-found page
/styleguide          Dev-only token and component reference (excluded from the sitemap)
```

**301 redirects** (via `public/_redirects`, served by Cloudflare):

```
/recruitment                          /for-employers   301
/teaching-jobs                        /jobs            301
/contact-alt                          /contact         301
/tefl-tesol-courses                   /                301
/accommodation                        /                301
/agents                               /                301
/english-language-courses-in-the-uk   /                301
/faq                                  /                301
/language-course-pricing              /                301
/things-to-do-in-littlehampton        /                301
```

`/tefl-tesol-courses` goes to `/` because there is no TEFL page (§6). The last six are the retired "UK English courses" pages: de-linked from the old nav years ago but still resolving and possibly indexed (capture §6). Redirecting them to `/` consolidates any residual link equity (§14.1). `/gdpr-consent` already 404s: leave it dead and keep it out of the sitemap; the custom 404 handles it. `public/_redirects` also rewrites `/admin` → `/admin/index.html` (200).

---

## 5. Content model — `tina/config.ts` is the source of truth

The Tina schema defines the content shape for the whole site; everything else consumes the types Tina generates. Do not maintain a separate hand-written type alongside it. Read `tina/config.ts` for the exact fields.

**Placements, not vacancies.** The ten listings were never open vacancies: they are roles that had already been filled (Barry, 2 Sep 2026). The collection (MDX in `content/jobs/`) is a **record of placements**, a showcase of the work. Placement dates are shown as month + year only (the stored `postedDate` is the old listing date, not a verified fill date).

Fields, in outline: `title`, `active`, `postedDate`, `country` (Taiwan | China), `cities[]`, `employerType` (select), `vacancies`, `studentAges`, `classSize`, `salary { min, max, currency (TWD | RMB), period (month | hour), afterTax }`, `teachingHours`, `officeHours`, `schedule`, `requirements { degree, tefl, experience, passports[] }`, `benefits[]`, `visaSupport`, `startDates`, `body` (rich text). There is no `slug` and no `closingDate` field.

- **GBP approximations are computed at build time** from a single rates constant in the codebase (`lib/rates.ts`), never a field Barry fills in. Display as "approx. £…". Refreshed about twice a year; a stale rate degrades gracefully because it's labelled approximate.
- All ten placements are transcribed from capture §3. **Preserve the detail.** The salary and benefits granularity is this site's biggest differentiator against generic TEFL boards and must not be summarised away. Structured fields carry the headline facts; the rich-text body carries the rest (onboarding detail, curriculum notes, the Shanghai school's story).

### Field UX — this decides whether Barry actually uses it

Every field in `tina/config.ts` needs:

- A `label` in plain English: "Monthly salary (before tax)", not `salary.min`
- A `description` acting as a hint: "e.g. accommodation provided, flights reimbursed, health insurance"
- Sensible `ui.defaultItem` values so a new placement starts half-filled rather than blank (default `postedDate` to today, `active` to on, `country`/`currency` paired sensibly)
- `required: true` on genuinely required fields so the form validates instead of publishing something broken
- Selects, toggles and checkbox groups instead of free text wherever the value is a known set (country, currency, period, employer type, degree level, passports)

The **`active` toggle** hides a placement. Turning it off removes it from the `/jobs` lists and the sitemap and adds `noindex`, but the page stays live, so inbound links never 404. Barry never deletes anything.

Use `ui.filename.slugify` to generate the filename from the title. Barry never sees or types a slug. **The filename is the URL and must be stable after creation**: a later title edit must not rename the file or change the URL (that would break inbound links).

---

## 6. Pages

**`/`**: must fork clearly and immediately: "I'm a teacher looking for work" / "I'm hiring teachers". Don't bury either. Kept deliberately minimal: the hero fork and the sea scene, no content fetch (`docs/DECISIONS.md`, 2026-09-02). The old copy's found gem is the brand line; see §11.

**`/jobs`**: the record of placements. Browse by filter chip (country, type of school), not a select-and-sort bar (`docs/DECISIONS.md`, 2026-09-06). Cards are records: a "Filled" stamp, location, role, labelled facts (salary with approx-GBP, what was included), and the month. No apply flows, no "New" badges, no closing dates. Teacher CTAs point at `/contact`, `/profile` and mailto. Progressive enhancement: with JS disabled the full list renders and the filter controls are hidden. Results count announced via `aria-live`.

**`/jobs/[slug]`**: a case record: stamp, the story on the left, a fact file in the rail (salary as one fact), a single "we recruit for roles like this" callout after the record, then three more placements. **No JobPosting JSON-LD**: structured job-posting markup on filled roles would misrepresent them to Google. Hidden (`active` off) placements render normally but `noindex`, and are absent from lists and the sitemap. The TEFL *requirement* still appears as a fact.

**`/for-employers`**: the seven-service menu (Advertising, Shortlisting, Interviewing, Selection, Induction, Visa Support, Mobilisation) with one-line descriptions written fresh (the old site has none), and Barry Shorten's direct email (`barry.shorten@arunlanguagetraining.com`) as the CTA. Built as one row of tabs; the description of the service under the pointer or focus shows beneath it (`docs/DECISIONS.md`, 2026-09-07).

**`/tefl-course`**: **deleted** (2 Sep 2026). The ITTT affiliate arrangement is stale: no TEFL page, no TEFL cross-links or filter, no affiliate link anywhere. The original page spec is in Appendix A.

**`/contact`**: enquiry form (§7.1) plus the plain contact details: the info@ email as selectable text, phone +44 (0)7495 368 499, registered address.

**`/profile`**: the Teacher Profile wizard (§7.2, §7.3).

**`/privacy`**: port capture §5 **verbatim**. Code `TODO(SPEC §6)` notes mark that it was last updated May 2018, is written against EU GDPR and EEA transfers, and describes cookies and marketing the new site doesn't do. It needs a proper legal review (tracked in Asana). Until then it stays a verbatim port.

**404**: on-brand and useful: "This page seems to have flown." with the gull glyph and links to `/jobs` and `/`.

Footer (all pages): company number 9744912, registered address 7 Goda Road, Littlehampton BN17 6AS, phone, info@ email, the four social links (capture §4), privacy link. No web-designer credit.

---

## 7. Forms

**No application forms.** Candidates apply by email, as they do today, or through the Teacher Profile (§7.2). The `/profile` CV is the **only** file input on the site, and it is relayed, never stored. Do not build any other file upload, do not store CVs, and do not introduce any service that would receive them.

Because no personal data is stored anywhere in this system (both forms are relayed, never persisted), the site sets no cookies and collects nothing. Keep it that way.

### 7.1 Contact form

The enquiry form on `/contact`: name, email, message. No attachments, no phone field. Disclosure line under the submit button, in the old site's spirit: "This form collects your name and email address so we can reply to you. See our privacy policy." Handled by `POST /api/contact` in the Worker → **Resend** → `info@arunlanguagetraining.com`. Hardening spec in §8.3. Real success state; visible `mailto:` fallback if the endpoint errors; `<noscript>` shows the mailto path (Turnstile needs JS). The form is hidden until hydration.

### 7.2 Teacher Profile — `/profile`

*From Barry and Tom, 2 Sep 2026.* A client-side multi-step form (one static route; screens switched in React state). It opens with a destination question (Mainland China / Taiwan / open to either) and **forks**:

- **China** (and "either"): preferred locations, job type (**multi-select**, via the custom dropdown `components/Dropdown.tsx`, also used on the passport step), salary expectation (RMB/month), document readiness, passport country and expiry, background-check status.
- **Taiwan**: see §7.3.
- Every route ends with name, email and a CV (PDF/DOC/DOCX, 5 MB).

The Worker relays the lot to Barry's inbox via Resend with the CV as an email attachment. **Relay only, exactly as the contact form: nothing is stored anywhere.** No KV, no queue, no localStorage, no answer content in logs; the Worker forgets the file the moment Resend accepts it. The background-check question is a **flag only** ("clean" / "something to disclose"), with deliberately no free-text detail field: criminal-offence data must never transit email, and Barry follows up privately.

The route reuses the full §8.3 hardening stack (origin check, honeypot, time-trap, validation + CRLF strip, Turnstile, plain-text-only email body) at `POST /api/profile` in the same Worker, with its own additions: file size and extension checks, and filename sanitising. The §7.1 mailto path stays the no-JS fallback.

### 7.3 The Taiwan route

*Barry's brief, 6 Sep 2026, relayed by Tom: the copy source for the Taiwan steps.* The Taiwan route is intro → degree → age groups → passport → background check → clean/disclose flag → contact + CV. Barry's requirements, each asked as one question:

- A bachelor's degree **completed on campus** (online not accepted).
- A **national criminal background check**, named per passport country: FBI (USA), RCMP (Canada), Basic DBS (UK), Garda Police Certificate (Ireland), AFP National Police Check (Australia), Ministry of Justice Criminal Record Check (New Zealand). South Africa and Other get generic wording, not an invented name. Whether South African passports qualify at all is open with Barry (GitHub #9). The check must be **less than six months old** (asked as a follow-up when the check is done, on every route).
- Willing to teach **children aged 3–16 or 7–12**.

Buxibans (private language academies, like training centres in China or Korean hagwons) and "no apostille needed" are information on the intro screen, not questions.

Rules:

- **Disqualifying answers are soft flags**: a note for the candidate and a labelled line for Barry, never a dead end.
- "Open to either" runs the China set plus the two Taiwan-only questions (degree, ages).
- No salary or location step for Taiwan (not in the brief).
- The clean/disclose flag stays **flag-only**, with Barry's "minor offences such as a DUI are normally accepted" line as reassurance on Taiwan routes.
- Worker validation follows the same three blocks (every route / China set / Taiwan set) and ignores stray fields from the other set.

---

## 8. Security

The architecture is the first control: static files, no server runtime, no database, no accounts, no sessions, no stored PII. Most of the OWASP top ten has nothing to attach to. What remains is below, with each control mapped to the real risk it addresses.

### 8.1 Threat model

| # | Risk | Impact | Controls |
|---|---|---|---|
| 1 | Account takeover (GitHub / Cloudflare / TinaCloud / registrar / Resend) | Malicious content on a trusted domain | 2FA mandatory on all five; least-privilege tokens; ownership table in MAINTENANCE.md |
| 2 | npm supply chain | Malicious build output | Minimal deps; committed lockfile + `npm ci`; Dependabot with human review; CI build check |
| 3 | Form abuse | Spam floods Barry; header injection; relay abuse | Turnstile + honeypot + time-trap; validation; CRLF stripping; rate limit; length caps; file checks on `/api/profile` |
| 4 | Domain email spoofing | Phishing "from" their domain; candidates trust it with passports | SPF + DKIM + DMARC (careful rollout, §8.4) |
| 5 | DNS/domain hijack | Total impersonation | Registrar lock; DNSSEC (one click in Cloudflare); registrar 2FA |
| 6 | XSS / content injection | Script on a trusted page | Content only from authenticated editors via Tina's rich-text renderer (no raw `dangerouslySetInnerHTML`); strict CSP as backstop |
| 7 | Clickjacking / MIME sniffing / referrer leaks | Various | Header suite below |

### 8.2 HTTP headers — `public/_headers`

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: <see below>
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cross-Origin-Opener-Policy: same-origin

/admin/*
  X-Robots-Tag: noindex
```

The intended CSP hashed every inline `<script>` (sha256) from a post-build scan of `out/**/*.html`, with a policy of roughly:

```
default-src 'self';
script-src 'self' 'sha256-…' https://static.cloudflareinsights.com https://challenges.cloudflare.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self' https://cloudflareinsights.com https://challenges.cloudflare.com;
frame-src https://challenges.cloudflare.com;
frame-ancestors 'self';
base-uri 'self'; object-src 'none'; form-action 'self'
```

The spec's own fallback applies: if hash generation proves brittle, `script-src` falls back to `'unsafe-inline'`, recorded as an accepted risk in MAINTENANCE.md, because the other layers still hold. It was taken: the export has too many inline scripts for Cloudflare's header limit (`docs/DECISIONS.md`, 2026-09-02). `frame-ancestors 'self'` (not DENY), because Tina's contextual editing iframes the site from same-origin `/admin`. `/admin` gets its own CSP with the TinaCloud hosts, taken from the Tina docs, not guessed. HSTS preload is deliberately **not** set (hard to reverse); it's a later option (Asana, Icebox).

Also ship `/.well-known/security.txt` (contact: dpo@arunlanguagetraining.com, plus Tom's email).

### 8.3 Form endpoint hardening (the Worker routes)

Applies to `POST /api/contact` and `POST /api/profile`:

- `POST` only; reject other methods. Same-origin `Origin`/`Referer` check.
- **Turnstile** server-side verification (secret in Worker env). Invisible/managed widget on the form.
- **Honeypot** field (visually hidden, tempting name): any value ⇒ silently accept and drop.
- **Time-trap**: hidden render-timestamp; submissions under ~3s rejected.
- Validation: name ≤ 200 chars, valid email ≤ 254, message ≤ 5,000; **strip CR/LF from name and email** (header injection); reject empty. `/api/profile` adds file size/extension checks and filename sanitising (§7.2).
- Send via Resend: from `enquiries@send.arunlanguagetraining.com` (verified subdomain), `reply_to` = enquirer, to `info@`. User content is body text only: never interpolated into headers beyond `reply_to`, never rendered as HTML.
- **Cloudflare zone rate-limiting rule** (free tier includes one) on `POST /api/*`: 5 requests/minute/IP (covers both routes).
- Errors return a generic message; the page shows the mailto fallback. Log outcome + timestamp only, never message content.
- On success: 303 redirect to `/contact?sent=1` (works without JS if Turnstile is ever removed); JS enhances to an inline success state.

### 8.4 Email authentication — do not break Barry's inbox

Resend sends from the `send.` subdomain, so its DKIM/SPF records **cannot** interfere with however `info@` currently receives mail. Rollout: (1) record the domain's existing MX/SPF/DKIM before touching anything; (2) add Resend's records for `send.arunlanguagetraining.com`; (3) add root DMARC at `p=none` with a monitoring address; (4) only after a clean month of reports, consider `p=quarantine`. Each step and its rollback goes in MAINTENANCE.md.

### 8.5 Accounts, secrets, supply chain

- **2FA on:** GitHub, Cloudflare, TinaCloud, Resend, domain registrar. Registrar lock + DNSSEC on.
- **Secrets** (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `TINA_TOKEN`) live only in Cloudflare/TinaCloud env config, never in the repo. `NEXT_PUBLIC_TINA_CLIENT_ID` is public by design. `.env*` gitignored from the first commit. The Tina token is the read-only content token.
- **Cloudflare zone settings:** Full (strict) TLS, Always Use HTTPS, min TLS 1.2, Bot Fight Mode on.
- **Dependencies:** keep the tree small: Next, React, Tailwind, Tina. (satori + sharp for OG generation were planned and not taken; see §9.) Lockfile committed; CI installs with `npm ci`; Dependabot weekly, updates reviewed by Tom, validated by the CI build.
- **CI (GitHub Actions):** `npm ci && typecheck && lint && tinacms build && next build` on every push/PR. This is also what validates Dependabot PRs. Deploys happen via Cloudflare's git integration on `main` only.
- Repo private by default (§14.4). Editorial workflow off means TinaCloud commits straight to `main`, so there is no branch protection that would block it; safety is revertability, not gatekeeping.

---

## 9. SEO & performance

**No JobPosting JSON-LD** (2 Sep 2026): the placements are filled roles, and job-posting markup would misrepresent them. The original JobPosting spec is in Appendix A in case live vacancies ever return.

Site-wide `Organization` JSON-LD: legal name, URL, logo, address (7 Goda Road…), `sameAs` = the four socials (capture §4). Not yet built (GitHub #7).

- Per-page `metadata` (App Router API): titles, descriptions, canonical URLs, OG/Twitter tags.
- **OG images**: one designed static card (`public/images/og.png`, from `scripts/og-card.html`). Per-page cards generated with satori + sharp were the plan's first choice and were dropped to keep the dependency tree small (`docs/DECISIONS.md`, 2026-09-02).
- `app/sitemap.ts` + `app/robots.ts` (both work with static export): exclude hidden placements, `/admin`, `/styleguide`, `/gdpr-consent`. Robots disallows `/admin`.
- Web app manifest and icons (`app/manifest.ts`, `app/icon.png`, `app/apple-icon.png`).
- Performance: fonts self-hosted via `next/font` (subset, `display: swap`), lazy-load below the fold, zero third-party requests except the analytics beacon and Turnstile on the form pages. Target **Lighthouse 95+ on all four categories** on `/`, `/jobs`, and one placement page.
- **Cloudflare Web Analytics**: free, cookieless, one beacon script, already allowed in CSP. No Google Analytics, no cookie banner (the old site's GA + banner are dropped deliberately). The beacon ships only when `NEXT_PUBLIC_CF_BEACON_TOKEN` is set.
- After launch, submit the sitemap in Search Console.

---

## 10. TinaCMS setup

**Check the current Tina docs at https://tina.io/docs before changing the integration.** App Router guidance and the Cloudflare deployment story have both moved across versions. Verified as of Aug 2026: Tina + App Router + `output: 'export'` is a documented, working combination; the admin builds to static files served at `/admin/index.html` (`_redirects` rewrites `/admin` to it). Build order is always `tinacms build` then `next build`.

- Develop against **local mode** (`tinacms dev`) so the whole site builds and reviews without a TinaCloud account. The production build must build Tina's production client, not the local one (GitHub #1).
- Wire up **TinaCloud** as pure config: `clientId`, `token`, branch `main`. TinaCloud handles auth and user management: Barry is invited by email and never needs a GitHub account. This is the entire reason for Tina over a git-CMS alternative; don't substitute a GitHub-OAuth-based one.
- Free tier is 2 users (verified Aug 2026): Barry + Tom. Nothing that requires a paid tier without flagging it.
- **Editorial workflow off.** Direct commits to `main`. Barry must never meet drafts, branches or PRs. Every save is a commit; a bad edit is a one-line revert.
- Media: Tina's git media handler. Uploads land in the repo; no third-party asset service. EDITING-GUIDE tells Barry to keep photos under ~1 MB.
- If contextual (visual) editing works cleanly with this static App Router setup, wire it for the placement pages: Barry seeing his edits on the real page is a meaningful win. If it fights, **don't force it**; the plain `/admin` form is entirely sufficient. Record which you did and why.

---

## 11. Design — "Where the Arun meets the sea"

The old site already wrote the brand story without noticing: *"Our location, where the Arun river flows into the sea, gives us a relaxed and tranquil feel"* (capture §6). The firm is named for the Arun district: the river running off the South Downs, past Arundel, into the Channel at Littlehampton, where Barry answers his email. The design borrows that coast: chalk, flint, shingle, harbour water, gull-wing grey, and exactly one gull. Classy and sleek means restraint: the sea is the atmosphere, never the decoration.

Don't reproduce the old design (2015 Bootstrap, clashing orange CTAs; capture §7). Build something a candidate would trust with their passport details.

### 11.1 Palette — drawn from the Arun coast, anchored on the existing teal

Deepens the one recognisable element of the old brand (`#8CC0C7`, now the `brand-teal` token, used for washes and fills only) into something ownable. Usage discipline: **~80% neutrals, ~15% harbour teals, ~5% amber.** `app/globals.css` `@theme` is the source of truth for token values.

| Token | Hex | Named for | Use |
|---|---|---|---|
| `chalk` | `#FAF7F2` | Downs chalk | Page background |
| `foam` | `#EDF2F2` | Sea foam | Alternate section washes, chips |
| `shingle` | `#E8E1D5` | Climping beach | Occasional warm surface |
| `gull` | `#B7C2C7` | Gull-wing grey | Hairlines, borders, dividers |
| `flint` | `#55646B` | Arundel flint walls | Secondary text (AA on chalk) |
| `ink` | `#1E2C31` | — | Body text |
| `channel` | `#122E36` | The Channel at dusk | Headings, footer background |
| `harbour` | `#2E7D8A` | Littlehampton harbour | Brand, primary buttons, active states |
| `harbour-deep` | `#1F5763` | — | Link text on light, hover/pressed |
| `beak` | `#D9A441` | Herring-gull beak | Accent only: focus rings, tiny highlights. Never body text on light, never large fills |
| `rust` | `#A94438` | Groyne iron | Form errors |

Defined as CSS custom properties + Tailwind theme tokens. Contrast is a build gate: `flint`, `ink`, `harbour-deep` on `chalk` and `chalk` on `harbour`/`channel` must pass WCAG AA, and `scripts/check-contrast.mjs` asserts these and every other text-bearing pair, so a future tweak can't silently break it. Light theme only; no dark mode (one brand, one look, less to maintain).

### 11.2 Type

- **Display: Montserrat** (variable), semibold for headings. Chosen by Barry at Checkpoint A (Aug 2026) from an eleven-candidate comparison, replacing the original Fraunces (he found it too warm). A geometric sans that echoes the Futura Light of the logo lockup without touching the desktop-only Futura licence (`brand/README.md`).
- **Text & UI: Inter**: body 17–18px, line-height ~1.65, max ~68ch prose. `font-feature-settings: "tnum"` wherever salary figures appear so numbers align.
- Both self-hosted via `next/font`, subset. Real hierarchy: fluid `clamp()` scale, generous margins above headings.
- Eyebrow kickers over sections: Inter semibold ~13px, letterspaced caps, `harbour`. For example `TEACH IN TAIWAN`.

### 11.3 Motifs — the sea, kept on a leash

- **The gull.** One minimal two-stroke glyph (a distant gull over a horizon line), drawn once as an SVG. It appears only in its permitted placements, listed in `components/Gull.tsx`'s docblock (originally four: the wordmark, the favicon (gull on `harbour`), the footer horizon rule, and the 404 ("This page seems to have flown."); the wizard's completion card was added in the taste pass). It is never repeated, patterned, or animated. This is the whole seagull theme.
- **The chart.** Hero, footer and inner-page heading backgrounds carry an abstract nautical-chart drawing of the Arun mouth (the river's meander, a scatter of depth-sounding marks, a fragment of a compass rose) as a single SVG at 4–6% opacity on `chalk` (slightly higher on `channel`). Admiralty-chart language: precise, quiet, deeply of-this-place. Never behind body text.
- **The tide line.** A 1px, low-amplitude wave rule in `gull`: section divider and kicker underline. The only wave rule on the site.
- **The sea scene.** The home page's shore and shoal (`components/Shore.tsx`, `components/Shoal.tsx`) are the one sanctioned ambient animation, CSS-only and stilled under `prefers-reduced-motion`.
- **Imagery:** no stock photos. Abstract treatments + strong typography at launch, with clearly marked, aspect-ratio-documented slots for real photographs later (Littlehampton harbour light, the Arun at Arundel; not stock classrooms).

### 11.4 Components

- **Cards:** white on `chalk` (`docs/DECISIONS.md`, 2026-09-06; originally chalk on foam), 1px `gull` border, 14px radius, haze shadow, hover: 2px lift + border shifts to `harbour`. Two card recipes plus `field`, `chip`, `stamp` and `fact-label` utilities in `app/globals.css`, all shown on `/styleguide`. Placement cards: kicker + "Filled" stamp, location, role, labelled facts (salary in tabular figures with approx-£), the month.
- **Buttons:** primary `harbour` bg / `chalk` text, 10px radius, pressed `harbour-deep`; secondary transparent with 1.5px `harbour` border. Focus-visible ring: 2px `beak`, 2px offset, distinctive and unmissable.
- **Filter chips:** `foam` bg / `channel` text; active inverts to `channel` bg / `chalk` text.
- **"Roles like this" callout:** one per placement page, after the record. It replaces the original apply panel (Appendix A).
- **Footer:** `channel` bg, `chalk` text, chart motif faint, the gull sitting on a thin horizon rule above the company details.
- **Motion:** CSS-only, 150–200ms ease-out (card lifts, fades). Everything honours `prefers-reduced-motion`. The sea scene (§11.3) is the one ambient exception.
- **Accessibility bar:** WCAG AA contrast throughout, keyboard-navigable, visible focus states, semantic landmarks (`header/nav/main/footer`), skip link, alt text, filter results announced via `aria-live`.

Layout: generous whitespace, max-width prose, mobile-first. A large share of TEFL candidates browse on a phone.

---

## 12. Documentation

**`docs/EDITING-GUIDE.md`**: for Barry. Plain English, no technical vocabulary, no screenshots. How to log in, add a placement, change a detail, hide a placement (the toggle; never delete), add a photo (keep it under 1 MB), and what to do if something looks wrong (message Tom, don't panic, nothing is broken permanently). Assume he has never used a CMS. Under two pages. (GitHub #6.)

**`docs/MAINTENANCE.md`**: for Tom. What's deployed where; the **ownership table** (every account (GitHub, Cloudflare, TinaCloud, Resend, registrar): who owns it, 2FA status, what it controls); how to roll back a bad content edit (one revert); how to add a schema field; the GBP rates constant and its twice-yearly refresh; the DMARC rollout state and rollback; the CSP accepted-risk fallback and the accepted audit moderates; yearly costs and exactly what would trigger a paid tier; what to check if the site stops rebuilding; and the cutover checklist. (GitHub #5.)

---

## 13. Launch

The build order (Appendix A) ran steps 1–7 and the amendments; the history is in `docs/STATUS.md`. Everything left is a ticket: infrastructure, accounts, Barry's sign-offs and the cutover in Asana; code in GitHub issues.

**Three review checkpoints.** Stop at each one and show the work (CLAUDE.md guardrail 1).

- **⛔ Checkpoint A — styleguide and shell.** Closed Aug 2026: Barry chose Montserrat.
- **⛔ Checkpoint B — Tina schema in the admin.** Closed 1 Sep 2026: full Barry walkthrough (create, slug lock, no delete or rename, edit round-trip).
- **⛔ Checkpoint C — pre-cutover review.** Open. Comes after deploy, TinaCloud and the pre-launch checks, and before DNS moves.

**What must be true at launch:**

- **Deploy:** Cloudflare Workers Builds from the repo (fallback: Pages), building Tina's production client; custom domain; Full (strict) TLS and the §8.5 zone settings; real Turnstile keys; the Worker's two routes attached with real secrets; Resend verified on the `send.` subdomain; DMARC `p=none`; the `/api/*` rate-limit rule; the Web Analytics token; CI and Dependabot on.
- **TinaCloud:** connected (clientId, token, branch `main`), editorial workflow off, Barry and Tom invited (the two free seats), contextual editing only if it cooperates. **The whole Barry loop tested for real:** log in as him, add a dummy placement, watch it commit → build → appear, hide it, revert the commit.
- **Docs and checks:** both §12 docs; redirect spot-checks; a real contact-form send and a real Teacher Profile send (with a CV); then Checkpoint C; then the DNS cutover, sitemap submission in Search Console, and post-launch checks (redirects live, analytics receiving).

---

## 14. Defaults chosen — flag if you disagree

1. **Legacy UK-courses URLs 301 → `/`** (the line looks retired: de-linked years ago, pre-Brexit copy). Confirm with Barry; if it ever revives, those are new pages.
2. **Turnstile on the form pages**: one third-party script, on the form pages only, for a real spam problem. If its no-cookie claim fails verification, drop it and keep honeypot + time-trap + rate limit.
3. ~~**Fraunces** for display type~~: **resolved at Checkpoint A (Aug 2026): Barry chose Montserrat** from a comparison of eleven candidates.
4. **Private repo**, Tom's GitHub account. (The repo is public as of Oct 2026; deciding which is an Asana task.)
5. **DMARC starts at `p=none`** (monitor only): nothing that could touch Barry's existing `info@` mail flow until reports are clean.
6. **No dark mode; no photography at launch**: slots documented for later.
7. ~~**`validThrough` only from an explicit closing date**~~: void with JobPosting (2 Sep 2026). Kept in Appendix A.

---

## Appendix A — superseded text, kept verbatim

The 2 Sep 2026 amendments (Barry: the listings were filled roles; the TEFL affiliate arrangement is stale) voided the passages below. They are kept word for word, so nothing from the original plan is lost, in case live vacancies or the TEFL page ever return. Do not build from them without a new decision.

### A.1 Original route list (§4)

```
/                    Home — split path for teachers vs employers
/jobs                Job index — filterable card grid
/jobs/[slug]         One page per listing (10 at launch, slugs in capture §3)
/for-employers       Employer services
/tefl-course         TEFL/TESOL affiliate page
/contact             Contact + enquiry form
/privacy             Privacy policy (same path as old site — no redirect needed)
/admin               TinaCMS admin (generated by Tina, not hand-built)
/404                 Custom not-found page
```

Original redirect: `/tefl-tesol-courses    /tefl-course     301`

### A.2 Original content model (§5)

Jobs collection, MDX in `content/jobs/`:

```ts
{
  title, slug, active, postedDate,
  closingDate?,                                 // optional — only if a client sets one; drives JSON-LD validThrough
  country,                                      // Taiwan | China (select)
  cities[],                                     // list of city names
  employerType,                                 // kindergarten | primary | university | language-school (select)
  vacancies, studentAges, classSize,
  salary: { min, max, currency, period, afterTax },
                                                // currency: TWD | RMB (select); period: month | hour (select)
                                                // afterTax: toggle "Is this figure after tax?"
  teachingHours, officeHours, schedule,
  requirements: { degree, tefl, experience, passports[] },
                                                // degree: select; tefl: toggle; passports: checkbox group
                                                // (UK / Ireland / US / Canada / Australia / New Zealand / South Africa)
  benefits[],                                   // list — accommodation, flights, insurance, visa, bonuses…
  visaSupport, startDates,
  body                                          // rich text
}
```

- **GBP approximations are computed at build time** from a single rates constant in the codebase (`lib/rates.ts`, e.g. `{ RMB: 9.3, TWD: 40 }` — set real values at build) — never a field Barry fills in. Display as "approx. £…". JSON-LD always emits the original currency, never the conversion. MAINTENANCE.md documents a twice-yearly rate refresh; a stale rate degrades gracefully because it's labelled approximate.
- **ISO currency note:** the schema stores the display labels `RMB`/`TWD`, but JSON-LD must emit ISO 4217 codes — `RMB → CNY`, `TWD → TWD`. Map in one place.

The **`active` toggle** is how Barry retires a listing. Turning it off: removes the job from the index, the sitemap and the home page; strips its `JobPosting` JSON-LD; adds `noindex`; and keeps the page alive with a "This role has been filled" state linking to open roles — inbound links never 404. He never deletes anything.

Use `ui.filename.slugify` to generate slugs from the title. Barry never sees or types a slug. **Slug/filename must be stable after creation** — a later title edit must not rename the file or change the URL (that would break Google Jobs and inbound links).

### A.3 Original pages (§6)

**`/`** — must fork clearly and immediately: "I'm a teacher looking for work" / "I'm hiring teachers". Don't bury either. Below the fork: three-or-four live roles as cards, a short credibility block (the mission and who-we-are copy, capture §2.1, lightly modernised), the TEFL nudge, footer. The old copy's found gem is the brand line — see Design.

**`/jobs`** — card grid, filtered client-side by country, city, employer type, and whether a TEFL certificate is required; sortable by salary or newest. Filter state syncs to URL params (`?country=taiwan`) so filtered views are shareable. Each card leads with location, then salary (with approx-GBP and an "after tax" pill where true), then the two strongest benefits. Progressive enhancement: with JS disabled the full list renders and filter controls are hidden. Results count announced via `aria-live`. Empty-filter-result state: "No roles match — clear filters or email us; new roles arrive often."

**`/jobs/[slug]`** — full listing with a sticky apply panel (desktop right rail, mobile fixed bottom bar — a `mailto:` link, see Forms), and **`JobPosting` JSON-LD on every active one**. This is the single highest-value item in the build: it makes the roles eligible for Google Jobs, worth more to this business than everything else combined. Spec in §9. Cross-link `/tefl-course` from any job where `requirements.tefl` is true — the natural conversion moment, when a candidate discovers they're not yet eligible ("No TEFL yet? Get 15% off the 120-hour course →"). Inactive jobs render the filled state (see §5).

**`/for-employers`** — the seven-service menu (Advertising, Shortlisting, Interviewing, Selection, Induction, Visa Support, Mobilisation) as a clean grid with one-line descriptions written fresh (the old site has none), and Barry Shorten's direct email (`barry.shorten@arunlanguagetraining.com`) as the CTA.

**`/tefl-course`** — affiliate link `https://www.teflcourse.net/apply/?cu=LNMSR2017C`, code `LNMSR2017C`, 15% off US $249, 120-hour online ITTT course. Copy from capture §2.3 only (the live portion). `rel="sponsored"` on the affiliate link. No Australian-government claim.

### A.4 Original forms (§7)

**No application forms and no CV uploads.** Candidates apply by email, as they do today. Do not build file upload, do not store CVs, and do not introduce any service that would receive them.

**Apply panel** on each job page: a prominent `mailto:info@arunlanguagetraining.com` button with a pre-filled subject naming the role — `Application: Kindergarten teacher, Chengdu` — and a short pre-filled body prompting the candidate to attach a CV and state their nationality and qualifications. That subject line is the one improvement over the current site here: Barry can finally tell at a glance which role an email is about. Under the button, show the address as selectable text with the same subject noted, for people whose `mailto:` handler is broken.

**The only form on the site** is the general enquiry form on `/contact`: name, email, message. No attachments, no phone field. Disclosure line under the submit button in the old site's spirit: "This form collects your name and email address so we can reply to you. See our privacy policy." Handled by the contact route in the Worker → **Resend** → `info@arunlanguagetraining.com`. Hardening spec in §8.3. Real success state; visible `mailto:` fallback if the endpoint errors; `<noscript>` shows the mailto path (Turnstile needs JS).

### A.5 Original JobPosting JSON-LD (§9)

Per active job page:

- `title`, `description` (rendered from body, plain-ish HTML), `datePosted` from `postedDate`.
- `validThrough` **only when `closingDate` is set.** (Deliberate change from the draft, which derived expiry from `postedDate` — these are evergreen rolling listings with monthly start dates; an auto-derived expiry would silently drop still-open roles from Google's index, which is worse than none. Google only requires `validThrough` when a real expiry exists. The filled-state flow in §5 handles removal.)
- `employmentType: FULL_TIME`.
- `hiringOrganization`: Arun Language Training & Recruitment Ltd — client schools are confidential, and Google's staffing-agency guidance permits the agency here. Include logo URL.
- `jobLocation`: array of `Place` with `addressLocality` per city and `addressCountry` `CN`/`TW`.
- `baseSalary`: `MonetaryAmount` → `QuantitativeValue` `minValue`/`maxValue`, `unitText` `MONTH` or `HOUR` (Taiwan is hourly), `currency` as ISO — **`CNY`** for RMB listings, `TWD` for Taiwan.
- Absolute URLs everywhere. Validate every page with Google's Rich Results test before cutover; submit the sitemap in Search Console after.

Original OG plan: **OG images generated at build** (satori + sharp script, since `/api/og` can't exist under static export): a branded template — chart motif, gull mark, job title, salary, city — per job, plus one generic. If the deps annoy, fall back to a single designed static OG image; don't block on this.

Original default 7: **`validThrough` only from an explicit closing date** — evergreen listings shouldn't silently expire out of Google Jobs (§9).

### A.6 Original components (§11.4)

- **Cards:** `chalk` on `foam` sections, 1px `gull` border, 14px radius, haze shadow (`0 8px 30px rgba(18,46,54,0.07)`), hover: 2px lift + border shifts to `harbour`. Job cards: city + country first, salary large in tabular figures with approx-£ beneath in `flint`, "after tax" pill where true, two strongest benefits, posted date.
- **Apply panel:** desktop sticky right rail; mobile fixed bottom bar. The most prominent element on a job page.
- `beak` was also the "New" badge colour.

### A.7 Original build order (§13)

**Step 0 — done (1 Aug 2026):** full site crawl → `site-capture.md`; this plan. Remaining step-0 work at build start: `git init`, `.gitignore` (including `.env*`), first commit, private GitHub repo under Tom's account.

1. **Scaffold + design system.** create-next-app (TS, App Router), Tailwind, `output: 'export'`, design tokens, `next/font` (Montserrat + Inter), layout shell (header/nav/footer), the gull SVG, chart motif, tide-line divider, and a dev-only `/styleguide` page showing tokens, type scale, buttons, a sample job card.
   **⛔ CHECKPOINT A — stop and show the styleguide and shell, so the visual direction can be corrected before ten pages are built on it.**
2. **Tina schema + content.** `tina/config.ts` with full field UX (§5), all ten listings transcribed from capture §3, running in local mode.
   **⛔ CHECKPOINT B — stop and show the schema labels/hints and one job open in the admin form. This is the screen Barry lives in; it's much cheaper to fix now than to migrate later.**
3. `/jobs` index (filters, sort, URL params, empty state) → `/jobs/[slug]` (full layout, apply panel, JSON-LD, filled state, TEFL cross-link).
4. Home, `/for-employers`, `/tefl-course`.
5. `/contact` form + the Worker contact route with the full §8.3 hardening; `/privacy` (verbatim + TODO); 404.
6. Redirects (`_redirects`, all ten legacy paths), `sitemap.ts`, `robots.ts`, per-page metadata, OG build script, favicons/manifest, analytics beacon.
7. **Security + quality pass:** `_headers` + CSP hash generator, `security.txt`, contrast assertions, axe run, Lighthouse 95+ on all four categories, `npm audit` clean-or-justified.
8. **Deploy:** Cloudflare Workers Builds from the repo (fallback: Pages), custom domain, Full (strict) TLS, zone settings (§8.5), Turnstile keys, Resend domain verification on `send.` subdomain, DMARC `p=none`, rate-limit rule, Web Analytics token. CI workflow + Dependabot on.
9. **TinaCloud:** connect (clientId/token/branch), editorial workflow off, invite Barry (+ Tom = 2 free seats), contextual editing if it cooperates. **Test the entire Barry loop for real:** log in as him, add a dummy job, watch it commit → build → appear; toggle it filled; revert the commit.
10. **Docs + launch:** both docs files; Rich Results test on every job page; redirect spot-checks; a real contact-form send and a real mailto apply; then
    **⛔ CHECKPOINT C — pre-cutover review.** Then DNS cutover to the new deployment, submit sitemap in Search Console, and post-launch checks (redirects live, Google Jobs pickup over the following days, analytics receiving).

### A.8 Original intro and §2 business line

"Three review checkpoints are built into the build order. Stop at each one." The plan superseded an earlier draft prompt.

"It also earns affiliate revenue on a $249 online TEFL/TESOL certificate (ITTT, code `LNMSR2017C`)." Tone note, original: "Note the live site's H1 says … do **not** carry over the 'Accredited by the Australian Government' claim on the TEFL page (it belongs to a retired partnership that is commented out in the old HTML — the live product is only the ITTT $249 course, see capture §1/§2.3)."

### A.9 The amendment blocks, as written

These sat at the top of `PLAN.md` and overrode the sections they contradicted. Their content is folded into §4–§7 above; the blocks are kept as written for the record (including the first, placeholder version of the Taiwan route). Code that cited "PLAN amendment 2 Sep 2026" now cites §5–§6 (placements), §7.2 (profile) or §7.3 (Taiwan addendum).

> **Amendment — 2 Sep 2026 (from Barry, via Tom; overrides anything below that
> contradicts it):**
>
> 1. **The ten listings were never open vacancies** — they are roles that had
>    already been filled. The old site presented them as live; that was wrong.
>    `/jobs` is therefore a **record of placements** (a showcase of the work),
>    not a job board: no apply flows, no apply panel or mobile apply bar, no
>    "New" badges, no closing dates, and **no JobPosting JSON-LD** — structured
>    job-posting markup on filled roles would misrepresent them to Google, so
>    the whole of §9's JobPosting section is void. Placement dates are shown as
>    month + year only (the stored dates are the old listing dates, not
>    verified fill dates). Teachers are still recruited — by emailing a CV to
>    info@ — so the teacher CTAs point at `/contact` and mailto, and job pages
>    carry a "we recruit for similar roles" card instead of an apply panel.
>    The `active` toggle now simply hides a placement from the lists (its URL
>    stays live, noindexed).
> 2. **`/tefl-course` is deleted entirely** — the ITTT affiliate arrangement is
>    stale. No TEFL page, no TEFL cross-links or filter, no affiliate link
>    anywhere; the legacy `/tefl-tesol-courses` path 301s to `/`. The TEFL
>    *requirement* still appears as a fact on placement records.

> **Amendment — 2 Sep 2026 (Teacher Profile, from Barry and Tom; overrides
> anything below that contradicts it, including §7's "only form on the site"
> and "no CV uploads" clauses — for this one flow only):**
>
> 3. **A Teacher Profile wizard at `/profile`.** A client-side multi-step
>    form (one static route; screens switched in React state) where a
>    candidate answers six questions — preferred locations, job type, salary
>    expectation (RMB/month), document readiness, passport country and
>    expiry, background-check status — then gives name, email and a CV
>    (PDF/DOC/DOCX, 5 MB), and the Worker relays the lot to Barry's inbox
>    via Resend with the CV as an email attachment. **Relay only, exactly as
>    the contact form: nothing is stored anywhere** — no KV, no queue, no
>    localStorage, no answer content in logs; the Worker forgets the file
>    the moment Resend accepts it. The background-check question is a
>    **flag only** ("clean" / "something to disclose") with deliberately no
>    free-text detail field — criminal-offence data must never transit
>    email; Barry follows up privately. The route reuses the full §8.3
>    hardening stack (origin check, honeypot, time-trap, validation + CRLF
>    strip, Turnstile, plain-text-only email body) at `POST /api/profile`
>    in the same Worker, with its own additions: file size/extension checks
>    and filename sanitising. §7's mailto path stays the no-JS fallback.
>    Cite this block in code comments as "PLAN amendment 2 Sep 2026
>    (profile)".
>
>    *Addendum, same day:* the wizard now opens with a destination question
>    — Mainland China / Taiwan / open to either — and **forks**: China and
>    "either" run the six questions above (job type became **multi-select**
>    via a custom dropdown, `components/Dropdown.tsx`, also used on the
>    passport step); Barry's Taiwan question set was still being written,
>    so the Taiwan route was a placeholder step collecting contact details
>    + CV only until the real questions landed (below).
>
>    *Taiwan addendum, 6 Sep 2026 (Barry's brief, relayed by Tom — the copy
>    source for the Taiwan steps):* the Taiwan route is now intro → degree
>    → age groups → passport → background check → clean/disclose flag →
>    contact + CV. Barry's requirements, each as one question: bachelor's
>    degree **completed on campus** (online not accepted); a **national
>    criminal background check** named per passport country — FBI (USA),
>    RCMP (Canada), Basic DBS (UK), Garda Police Certificate (Ireland), AFP
>    National Police Check (Australia), Ministry of Justice Criminal Record
>    Check (New Zealand); South Africa and Other get generic wording, not an
>    invented name — **less than six months old** (asked as a follow-up when
>    the check is done, on every route); willing to teach **children aged
>    3–16 or 7–12**. Buxibans (private language academies, like training
>    centres in China or Korean hagwons) and "no apostille needed" are
>    information on the intro screen, not questions. Rules: **disqualifying
>    answers are soft flags** (a note for the candidate, a labelled line for
>    Barry, never a dead end); "open to either" runs the China set plus the
>    two Taiwan-only questions (degree, ages); no salary or location step for
>    Taiwan (not in the brief); the clean/disclose flag stays **flag-only**,
>    with Barry's "minor offences such as a DUI are normally accepted" line
>    as reassurance on Taiwan routes. Worker validation follows the same
>    three blocks (every route / China set / Taiwan set) and ignores stray
>    fields from the other set. Cite as "PLAN amendment 2 Sep 2026
>    (profile), Taiwan addendum".
