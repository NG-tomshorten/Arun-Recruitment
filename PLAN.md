# Arun Language Training & Recruitment — implementation plan

**Status: ready to build.** This supersedes the earlier draft prompt. `site-capture.md` sits alongside this file and is the source of truth for all copy and data — it was built on 1 Aug 2026 from a full crawl of the live site, including content hidden in HTML comments. Section references (§3 jobs, §4 company/social, etc.) point into that file.

Three review checkpoints are built into the build order. Stop at each one.

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

---

## 1. Architecture (decisions locked)

- **Next.js (App Router), TypeScript, Tailwind CSS**, British English (`lang="en-GB"`) throughout.
- **Fully static output** — `output: 'export'` in `next.config`. No Next server runtime exists in production, so there is no request-time framework surface to attack or patch. Verified working with TinaCMS + App Router (Tina's admin builds to static files; content is read at build time; see §10).
- **TinaCMS** — git-backed content, no database, no custom admin, no custom auth. Content as MDX in `content/`, schema in `tina/config.ts`. `tinacms build` runs **before** `next build`.
- **Deployed to Cloudflare Workers with static assets, via Workers Builds git integration** (push → build → live). Cloudflare has put Pages into maintenance mode and directs new projects to Workers with static assets, which serves `_headers`/`_redirects` files the same way. If Workers Builds fights during setup, plain Cloudflare Pages is the accepted fallback — same repo, same files, same £0.
- **The only dynamic code in production is the contact-form route** inside the same Worker (~100 lines). A form outage can never take the site down, and the site can never take the form down.
- **No client-side JS except:** jobs filter, mobile nav, contact-form submit + Turnstile widget, Cloudflare Web Analytics beacon, and Tina's `/admin` SPA. Everything else is static HTML/CSS. CSS-only animation is fine.
- **No cookies, no stored personal data, no third-party asset services.** Fonts self-hosted via `next/font`. (Turnstile is Cloudflare's cookieless CAPTCHA — verify the no-cookie claim during build; if any cookie appears, drop Turnstile and rely on the honeypot stack, see §8.)
- `images: { unoptimized: true }` (image optimization doesn't run under static export). The site ships almost no raster images at launch; anything added is pre-sized/compressed and committed. No `/api/og` route — OG images are generated by a **build script** (see §9).

### Running cost

| Service | Tier | Cost |
|---|---|---|
| Cloudflare Workers/Pages + Web Analytics + Turnstile | Free | £0 |
| TinaCloud (verified Aug 2026: free tier = 2 users, managed git, media) | Free | £0 |
| Resend (contact form email; 100/day free) | Free | £0 |
| GitHub (private repo) | Free | £0 |
| Domain renewal (already owned) | — | ~£10–15/yr |

Target: **£0/month**. Do not introduce anything with a per-seat or per-request cost without flagging it first.

---

## 2. The business

A small West Sussex recruitment agency placing British and Commonwealth graduates into English-teaching jobs in Taiwan and mainland China. Two distinct audiences: **teachers** looking for a placement, and **employers** (schools, colleges, companies) who need instructors. It also earns affiliate revenue on a $249 online TEFL/TESOL certificate (ITTT, code `LNMSR2017C`).

Tone: warm, plainspoken, credible. A real person in Littlehampton who will answer your email — not a faceless job board. No recruitment-industry filler ("synergies", "solutions", "world-class"). Note the live site's H1 says "Language Training in Littlehampton" — wrong positioning; the new site leads with recruitment. Fix the live "Servcices" typo; do **not** carry over the "Accredited by the Australian Government" claim on the TEFL page (it belongs to a retired partnership that is commented out in the old HTML — the live product is only the ITTT $249 course, see capture §1/§2.3).

## 3. Two users, two very different needs

Design every decision around these two roles. Where they conflict, the owner wins.

**Barry (owner, non-technical, ~60s).** Needs to add a job, edit a salary, and mark a role as filled. Must never encounter: git, GitHub, markdown syntax, a deploy button, a branch, a pull request, or the word "commit". He logs in with an email address and a password, fills in labelled form fields, and clicks save.

**Tom (maintainer, technical, unpaid, wants to stay that way).** Zero on-call burden. No server to patch, no database to back up, no TLS to renew. Every content change is a git commit, so any mistake is a one-line revert. If Tom disappears for six months, the site keeps working and Barry keeps publishing.

---

## 4. Routes & redirects

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

**301 redirects** (via `public/_redirects`, served by Cloudflare):

```
/recruitment                          /for-employers   301
/teaching-jobs                        /jobs            301
/contact-alt                          /contact         301
/tefl-tesol-courses                   /tefl-course     301
/accommodation                        /                301
/agents                               /                301
/english-language-courses-in-the-uk   /                301
/faq                                  /                301
/language-course-pricing              /                301
/things-to-do-in-littlehampton        /                301
```

The last six are the retired "UK English courses" pages the draft plan didn't know about — de-linked from the old nav years ago but still resolving and possibly indexed (capture §6). Redirecting them to `/` consolidates any residual link equity. `/gdpr-consent` already 404s — leave it dead, keep it out of the sitemap; the custom 404 handles it.

---

## 5. Content model — `tina/config.ts` is the source of truth

The Tina schema defines the content shape for the whole site. Write it first; everything else consumes the types Tina generates. Do not maintain a separate hand-written `jobs.ts` type alongside it.

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
- All ten listings transcribed in capture §3. **Preserve the detail.** The salary and benefits granularity is this site's biggest differentiator against generic TEFL job boards and must not be summarised away. Structured fields carry the headline facts; the rich-text body carries the rest (onboarding detail, curriculum notes, the Shanghai school's story).

### Field UX — this decides whether Barry actually uses it

Every field in `tina/config.ts` needs:

- A `label` in plain English — "Monthly salary (before tax)", not `salary.min`
- A `description` acting as a hint — "e.g. accommodation provided, flights reimbursed, health insurance"
- Sensible `ui.defaultItem` values so a new job starts half-filled rather than blank (default `postedDate` to today, `active` to on, `country`/`currency` paired sensibly)
- `required: true` on genuinely required fields so the form validates instead of publishing something broken
- Selects, toggles and checkbox groups instead of free text wherever the value is a known set (country, currency, period, employer type, degree level, passports)

The **`active` toggle** is how Barry retires a listing. Turning it off: removes the job from the index, the sitemap and the home page; strips its `JobPosting` JSON-LD; adds `noindex`; and keeps the page alive with a "This role has been filled" state linking to open roles — inbound links never 404. He never deletes anything.

Use `ui.filename.slugify` to generate slugs from the title. Barry never sees or types a slug. **Slug/filename must be stable after creation** — a later title edit must not rename the file or change the URL (that would break Google Jobs and inbound links).

---

## 6. Pages

**`/`** — must fork clearly and immediately: "I'm a teacher looking for work" / "I'm hiring teachers". Don't bury either. Below the fork: three-or-four live roles as cards, a short credibility block (the mission and who-we-are copy, capture §2.1, lightly modernised), the TEFL nudge, footer. The old copy's found gem is the brand line — see Design.

**`/jobs`** — card grid, filtered client-side by country, city, employer type, and whether a TEFL certificate is required; sortable by salary or newest. Filter state syncs to URL params (`?country=taiwan`) so filtered views are shareable. Each card leads with location, then salary (with approx-GBP and an "after tax" pill where true), then the two strongest benefits. Progressive enhancement: with JS disabled the full list renders and filter controls are hidden. Results count announced via `aria-live`. Empty-filter-result state: "No roles match — clear filters or email us; new roles arrive often."

**`/jobs/[slug]`** — full listing with a sticky apply panel (desktop right rail, mobile fixed bottom bar — a `mailto:` link, see Forms), and **`JobPosting` JSON-LD on every active one**. This is the single highest-value item in the build: it makes the roles eligible for Google Jobs, worth more to this business than everything else combined. Spec in §9. Cross-link `/tefl-course` from any job where `requirements.tefl` is true — the natural conversion moment, when a candidate discovers they're not yet eligible ("No TEFL yet? Get 15% off the 120-hour course →"). Inactive jobs render the filled state (see §5).

**`/for-employers`** — the seven-service menu (Advertising, Shortlisting, Interviewing, Selection, Induction, Visa Support, Mobilisation) as a clean grid with one-line descriptions written fresh (the old site has none), and Barry Shorten's direct email (`barry.shorten@arunlanguagetraining.com`) as the CTA.

**`/tefl-course`** — affiliate link `https://www.teflcourse.net/apply/?cu=LNMSR2017C`, code `LNMSR2017C`, 15% off US $249, 120-hour online ITTT course. Copy from capture §2.3 only (the live portion). `rel="sponsored"` on the affiliate link. No Australian-government claim.

**`/contact`** — enquiry form (see Forms) plus the plain contact details: info@ email as selectable text, phone +44 (0)7495 368 499, registered address.

**`/privacy`** — port capture §5 **verbatim**. Add a code `TODO` noting it was last updated May 2018, is written against EU GDPR and EEA transfers, and describes cookies/marketing the new site doesn't do; needs a proper legal review — not your job and not mine.

**404** — on-brand, useful: "This page seems to have flown." with the gull glyph and links to `/jobs` and `/`.

Footer (all pages): company number 9744912, registered address 7 Goda Road, Littlehampton BN17 6AS, phone, info@ email, the four social links (capture §4), privacy link. No web-designer credit.

---

## 7. Forms

**No application forms and no CV uploads.** Candidates apply by email, as they do today. Do not build file upload, do not store CVs, and do not introduce any service that would receive them.

**Apply panel** on each job page: a prominent `mailto:info@arunlanguagetraining.com` button with a pre-filled subject naming the role — `Application: Kindergarten teacher, Chengdu` — and a short pre-filled body prompting the candidate to attach a CV and state their nationality and qualifications. That subject line is the one improvement over the current site here: Barry can finally tell at a glance which role an email is about. Under the button, show the address as selectable text with the same subject noted, for people whose `mailto:` handler is broken.

**The only form on the site** is the general enquiry form on `/contact`: name, email, message. No attachments, no phone field. Disclosure line under the submit button in the old site's spirit: "This form collects your name and email address so we can reply to you. See our privacy policy." Handled by the contact route in the Worker → **Resend** → `info@arunlanguagetraining.com`. Hardening spec in §8.3. Real success state; visible `mailto:` fallback if the endpoint errors; `<noscript>` shows the mailto path (Turnstile needs JS).

Because no personal data is stored anywhere in this system — the form is relayed, never persisted — the site sets no cookies and collects nothing. Keep it that way.

---

## 8. Security

The architecture is the first control: static files, no server runtime, no database, no accounts, no sessions, no stored PII. Most of the OWASP top ten has nothing to attach to. What remains is below — each control mapped to the real risk it addresses.

### 8.1 Threat model

| # | Risk | Impact | Controls |
|---|---|---|---|
| 1 | Account takeover (GitHub / Cloudflare / TinaCloud / registrar / Resend) | Malicious content on a trusted domain | 2FA mandatory on all five; least-privilege tokens; ownership table in MAINTENANCE.md |
| 2 | npm supply chain | Malicious build output | Minimal deps; committed lockfile + `npm ci`; Dependabot with human review; CI build check |
| 3 | Contact-form abuse | Spam floods Barry; header injection; relay abuse | Turnstile + honeypot + time-trap; validation; CRLF stripping; rate limit; length caps |
| 4 | Domain email spoofing | Phishing "from" their domain; candidates trust it with passports | SPF + DKIM + DMARC (careful rollout, §8.4) |
| 5 | DNS/domain hijack | Total impersonation | Registrar lock; DNSSEC (one click in Cloudflare); registrar 2FA |
| 6 | XSS / content injection | Script on a trusted page | Content only from authenticated editors via Tina's rich-text renderer (no raw `dangerouslySetInnerHTML`); strict CSP as backstop |
| 7 | Clickjacking / MIME sniffing / referrer leaks | Various | Header suite below |

### 8.2 HTTP headers — `public/_headers`

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: <generated at build — see below>
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cross-Origin-Opener-Policy: same-origin

/admin/*
  X-Robots-Tag: noindex
```

**CSP is generated by a small post-build script**, because Next's static export emits inline bootstrap scripts that can't take nonces: the script scans `out/**/*.html`, hashes every inline `<script>` (sha256), and writes the final `_headers` with a policy of roughly:

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

`frame-ancestors 'self'` (not DENY) because Tina's contextual editing iframes the site from same-origin `/admin`. The `/admin` path additionally needs TinaCloud hosts in `connect-src` — take the exact hostnames from the Tina docs during build, don't guess. If hash generation proves brittle across builds, fall back to `'unsafe-inline'` for `script-src` and record it as an accepted risk in MAINTENANCE.md — the other layers still hold. HSTS preload is deliberately **not** set (hard to reverse); note it as a later option.

Also ship `/.well-known/security.txt` (contact: dpo@arunlanguagetraining.com, plus Tom's email).

### 8.3 Contact endpoint hardening (the Worker route)

- `POST` only; reject other methods. Same-origin `Origin`/`Referer` check.
- **Turnstile** server-side verification (secret in Worker env). Invisible/managed widget on the form.
- **Honeypot** field (visually hidden, tempting name) — any value ⇒ silently accept and drop.
- **Time-trap** — hidden render-timestamp; submissions under ~3s rejected.
- Validation: name ≤ 200 chars, valid email ≤ 254, message ≤ 5,000; **strip CR/LF from name and email** (header injection); reject empty.
- Send via Resend: from `enquiries@send.arunlanguagetraining.com` (verified subdomain), `reply_to` = enquirer, to `info@`. User content is body text only — never interpolated into headers beyond `reply_to`, never rendered as HTML.
- **Cloudflare zone rate-limiting rule** (free tier includes one) on `POST /api/contact` — e.g. 5 requests/minute/IP.
- Errors return a generic message; the page shows the mailto fallback. Log outcome + timestamp only — never message content.
- On success: 303 redirect to `/contact?sent=1` (works without JS if Turnstile is ever removed); JS enhances to an inline success state.

### 8.4 Email authentication — do not break Barry's inbox

Resend sends from the `send.` subdomain, so its DKIM/SPF records **cannot** interfere with however `info@` currently receives mail. Rollout: (1) record the domain's existing MX/SPF/DKIM before touching anything; (2) add Resend's records for `send.arunlanguagetraining.com`; (3) add root DMARC at `p=none` with a monitoring address; (4) only after a clean month of reports, consider `p=quarantine`. Each step and its rollback goes in MAINTENANCE.md.

### 8.5 Accounts, secrets, supply chain

- **2FA on:** GitHub, Cloudflare, TinaCloud, Resend, domain registrar. Registrar lock + DNSSEC on.
- **Secrets** (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `TINA_TOKEN`) live only in Cloudflare/TinaCloud env config — never in the repo. `NEXT_PUBLIC_TINA_CLIENT_ID` is public by design. `.env*` gitignored from the first commit. The Tina token is the read-only content token.
- **Cloudflare zone settings:** Full (strict) TLS, Always Use HTTPS, min TLS 1.2, Bot Fight Mode on.
- **Dependencies:** keep the tree small (Next, Tailwind, Tina, and satori+sharp for OG generation — that's roughly it). Lockfile committed; CI installs with `npm ci`; Dependabot weekly, updates reviewed by Tom, validated by the CI build.
- **CI (GitHub Actions):** `npm ci && typecheck && lint && tinacms build && next build` on every push/PR — this is also what validates Dependabot PRs. Deploys happen via Cloudflare's git integration on `main` only.
- Repo private. Editorial workflow off means TinaCloud commits straight to `main` — so no branch protection that would block it; safety is revertability, not gatekeeping.

---

## 9. SEO & performance

### JobPosting JSON-LD (the highest-value item — get it exactly right)

Per active job page:

- `title`, `description` (rendered from body, plain-ish HTML), `datePosted` from `postedDate`.
- `validThrough` **only when `closingDate` is set.** (Deliberate change from the draft, which derived expiry from `postedDate` — these are evergreen rolling listings with monthly start dates; an auto-derived expiry would silently drop still-open roles from Google's index, which is worse than none. Google only requires `validThrough` when a real expiry exists. The filled-state flow in §5 handles removal.)
- `employmentType: FULL_TIME`.
- `hiringOrganization`: Arun Language Training & Recruitment Ltd — client schools are confidential, and Google's staffing-agency guidance permits the agency here. Include logo URL.
- `jobLocation`: array of `Place` with `addressLocality` per city and `addressCountry` `CN`/`TW`.
- `baseSalary`: `MonetaryAmount` → `QuantitativeValue` `minValue`/`maxValue`, `unitText` `MONTH` or `HOUR` (Taiwan is hourly), `currency` as ISO — **`CNY`** for RMB listings, `TWD` for Taiwan.
- Absolute URLs everywhere. Validate every page with Google's Rich Results test before cutover; submit the sitemap in Search Console after.

Site-wide `Organization` JSON-LD: legal name, URL, logo, address (7 Goda Road…), `sameAs` = the four socials (capture §4).

### The rest

- Per-page `metadata` (App Router API): titles, descriptions, canonical URLs, OG/Twitter tags.
- **OG images generated at build** (satori + sharp script, since `/api/og` can't exist under static export): a branded template — chart motif, gull mark, job title, salary, city — per job, plus one generic. If the deps annoy, fall back to a single designed static OG image; don't block on this.
- `app/sitemap.ts` + `app/robots.ts` (both work with static export): exclude inactive jobs, `/admin`, `/gdpr-consent`. Robots disallows `/admin`.
- Performance: system-hosted fonts via `next/font` (subset, `display: swap`), lazy-load below the fold, zero third-party requests except the analytics beacon and Turnstile on `/contact`. Target **Lighthouse 95+ on all four categories** on `/`, `/jobs`, and one job page.
- **Cloudflare Web Analytics** — free, cookieless, one beacon script, already allowed in CSP. No Google Analytics, no cookie banner (the old site's GA + banner are dropped deliberately).

---

## 10. TinaCMS setup

**Check the current Tina docs at https://tina.io/docs before writing the integration** — App Router guidance and the Cloudflare deployment story have both moved across versions. Verified as of Aug 2026: Tina + App Router + `output: 'export'` is a documented, working combination; the admin builds to static files served at `/admin/index.html` (Cloudflare serves the directory index automatically — if `/admin` 404s, add a `/admin → /admin/index.html 200` line to `_redirects`). Build order is always `tinacms build` then `next build`.

- Develop against **local mode** (`tinacms dev`) so the whole site builds and reviews without a TinaCloud account.
- Wire up **TinaCloud last**, as pure config: `clientId`, `token`, branch `main`. TinaCloud handles auth and user management — Barry is invited by email and never needs a GitHub account. This is the entire reason for Tina over a git-CMS alternative; don't substitute a GitHub-OAuth-based one.
- Free tier is 2 users (verified Aug 2026) — Barry + Tom. Nothing that requires a paid tier without flagging it.
- **Editorial workflow off.** Direct commits to `main`. Barry must never meet drafts, branches or PRs. Every save is a commit; a bad edit is a one-line revert.
- Media: Tina's git media handler — uploads land in the repo, no third-party asset service. EDITING-GUIDE tells Barry to keep photos under ~1 MB.
- If contextual (visual) editing works cleanly with this static App Router setup, wire it for the job pages — Barry seeing his edits on the real page is a meaningful win. If it fights, **don't force it**; the plain `/admin` form is entirely sufficient. Record which you did and why.

---

## 11. Design — "Where the Arun meets the sea"

The old site already wrote the brand story without noticing: *"Our location, where the Arun river flows into the sea, gives us a relaxed and tranquil feel"* (capture §6). The firm is named for the Arun district — the river running off the South Downs, past Arundel, into the Channel at Littlehampton, where Barry answers his email. The design borrows that coast: chalk, flint, shingle, harbour water, gull-wing grey — and exactly one gull. Classy and sleek means restraint: the sea is the atmosphere, never the decoration.

Don't reproduce the current design (2015 Bootstrap, clashing orange CTAs — capture §7). Build something a candidate would trust with their passport details.

### 11.1 Palette — drawn from the Arun coast, anchored on the existing teal

Deepens the one recognisable element of the current brand (`#8CC0C7`) into something ownable. Usage discipline: **~80% neutrals, ~15% harbour teals, ~5% amber.**

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
| `beak` | `#D9A441` | Herring-gull beak | Accent only: focus rings, "New" badge, tiny highlights. Never body text on light, never large fills |
| `rust` | `#A94438` | Groyne iron | Form errors |

Define as CSS custom properties + Tailwind theme tokens. Contrast is a build gate: `flint`, `ink`, `harbour-deep` on `chalk` and `chalk` on `harbour`/`channel` must pass WCAG AA — include a tiny script or test that asserts the pairs, so a future tweak can't silently break it. Light theme only; no dark mode (one brand, one look, less to maintain).

### 11.2 Type

- **Display: Montserrat** (variable), semibold for headings — chosen by Barry at Checkpoint A (Aug 2026) from an eleven-candidate comparison, replacing the original Fraunces (he found it too warm). A geometric sans that echoes the Futura Light of the logo lockup without touching the desktop-only Futura licence.
- **Text & UI: Inter** — body 17–18px, line-height ~1.65, max ~68ch prose. `font-feature-settings: "tnum"` wherever salary figures appear so numbers align.
- Both self-hosted via `next/font`, subset. Real hierarchy: fluid `clamp()` scale, generous margins above headings.
- Eyebrow kickers over sections: Inter semibold ~13px, letterspaced caps, `harbour` — e.g. `TEACH IN TAIWAN`.

### 11.3 Motifs — the sea, kept on a leash

- **The gull.** One minimal two-stroke glyph (a distant gull over a horizon line), drawn once as an SVG. It appears in exactly four places: the wordmark, the favicon (gull on `harbour`), the footer horizon rule, and the 404 ("This page seems to have flown."). It is never repeated, patterned, or animated. This is the whole seagull theme.
- **The chart.** Hero and footer backgrounds carry an abstract nautical-chart drawing of the Arun mouth — the river's meander, a scatter of depth-sounding marks, a fragment of a compass rose — as a single SVG at 4–6% opacity on `chalk` (slightly higher on `channel`). Admiralty-chart language: precise, quiet, deeply of-this-place. Never behind body text.
- **The tide line.** A 1px, low-amplitude wave rule in `gull` — section divider and kicker underline. The only wave on the site.
- **Imagery:** no stock photos. Abstract treatments + strong typography at launch, with clearly-marked, aspect-ratio-documented slots for real photographs later (Littlehampton harbour light, the Arun at Arundel — not stock classrooms).

### 11.4 Components

- **Cards:** `chalk` on `foam` sections, 1px `gull` border, 14px radius, haze shadow (`0 8px 30px rgba(18,46,54,0.07)`), hover: 2px lift + border shifts to `harbour`. Job cards: city + country first, salary large in tabular figures with approx-£ beneath in `flint`, "after tax" pill where true, two strongest benefits, posted date.
- **Buttons:** primary `harbour` bg / `chalk` text, 10px radius, pressed `harbour-deep`; secondary transparent with 1.5px `harbour` border. Focus-visible ring: 2px `beak`, 2px offset — distinctive and unmissable.
- **Filter chips:** `foam` bg / `channel` text; active inverts to `channel` bg / `chalk` text.
- **Apply panel:** desktop sticky right rail; mobile fixed bottom bar. The most prominent element on a job page.
- **Footer:** `channel` bg, `chalk` text, chart motif faint, the gull sitting on a thin horizon rule above the company details.
- **Motion:** CSS-only, 150–200ms ease-out (card lifts, fades). Everything honours `prefers-reduced-motion`.
- **Accessibility bar:** WCAG AA contrast throughout, keyboard-navigable, visible focus states, semantic landmarks (`header/nav/main/footer`), skip link, alt text, filter results announced via `aria-live`.

Layout: generous whitespace, max-width prose, mobile-first — a large share of TEFL candidates browse on a phone.

---

## 12. Documentation

**`docs/EDITING-GUIDE.md`** — for Barry. Plain English, no technical vocabulary, no screenshots. How to log in, add a job, change a salary, mark a role as filled (the toggle — never delete), add a photo (keep under 1 MB), and what to do if something looks wrong (message Tom, don't panic, nothing is broken permanently). Assume he has never used a CMS. Under two pages.

**`docs/MAINTENANCE.md`** — for Tom. What's deployed where; the **ownership table** (every account — GitHub, Cloudflare, TinaCloud, Resend, registrar — who owns it, 2FA status, what it controls); how to roll back a bad content edit (one revert); how to add a schema field; the GBP rates constant and its twice-yearly refresh; the DMARC rollout state and rollback; the CSP hash script and its accepted-risk fallback; yearly costs and exactly what would trigger a paid tier; what to check if the site stops rebuilding; and the cutover checklist (below).

---

## 13. Build order

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

---

## 14. Defaults chosen — flag if you disagree

1. **Legacy UK-courses URLs 301 → `/`** (the line looks retired: de-linked years ago, pre-Brexit copy). Confirm with Barry; if it ever revives, those are new pages.
2. **Turnstile on the contact form** — one third-party script, on one page, for a real spam problem. If its no-cookie claim fails verification, drop it and keep honeypot + time-trap + rate limit.
3. ~~**Fraunces** for display type~~ — **resolved at Checkpoint A (Aug 2026): Barry chose Montserrat** from a comparison of eleven candidates.
4. **Private repo**, Tom's GitHub account.
5. **DMARC starts at `p=none`** (monitor only) — nothing that could touch Barry's existing `info@` mail flow until reports are clean.
6. **No dark mode; no photography at launch** — slots documented for later.
7. **`validThrough` only from an explicit closing date** — evergreen listings shouldn't silently expire out of Google Jobs (§9).
