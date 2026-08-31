export const meta = {
  name: 'arun-step-2',
  description: 'PLAN 13 Step 2: Tina schema + ten job listings, plus schema-independent static pages',
  phases: [
    { title: 'Build', detail: 'tina/config.ts, ten job MDX files, privacy/404/_redirects' },
    { title: 'Verify', detail: 'adversarial fidelity and spec-conformance checks' },
    { title: 'Reconcile', detail: 'cross-check schema field names against all ten content files' },
  ],
}

const REPO = '/Users/tomshorten/Desktop/Code/ALT/Arun-Recruitment'

const HOUSE = `
PROJECT CONVENTIONS — these are hard rules, read ${REPO}/CLAUDE.md yourself for the full set.
- British English everywhere (organisation, programme, specialise, recognised, £).
- Design tokens only. Colours/type-sizes/radii come from @theme in app/globals.css. NEVER a raw hex
  or an arbitrary value like text-[17px] in a component. Read app/globals.css for the token names.
- Components live in components/, one export per file, NAMED export, never a default export.
  (Next.js route files app/**/page.tsx and app/not-found.tsx are the exception — they need default exports.)
- Use the @/ path alias for imports.
- Comments cite the spec section they implement, e.g. // PLAN §5.
- No dangerouslySetInnerHTML. No new npm dependencies. No raw personal data handling.
- Accessibility: semantic landmarks, visible focus, alt text, WCAG AA contrast.
- Tabular figures (the .tnum utility) wherever salary numbers appear.
- Read existing files (app/page.tsx, app/styleguide/page.tsx, components/Button.tsx, components/nav.ts)
  FIRST to match the established house style before writing anything new.
- Do NOT run npm install, npm run build, or modify package.json — the orchestrator owns those.
- Do NOT create git commits.
`

// The authoritative field spec, derived by the orchestrator from PLAN §5.
// Every agent works from THIS so the schema and the content files agree without a dependency.
const FIELDS = `
TINA JOBS COLLECTION — authoritative field spec (from PLAN §5).
Collection: name 'job', label 'Job listings', path 'content/jobs', format 'mdx'.
Frontmatter keys must be EXACTLY these names:

  title            string, required.  Label "Job title"
  active           boolean, default true. Label "Show this job on the website"
                   description: "Turn this off when the role is filled. The page stays live with a
                   'This role has been filled' message — never delete a job."
  postedDate       string, ui.dateFormat, required. Label "Date posted"
  closingDate      string, ui.dateFormat, OPTIONAL. Label "Closing date (optional)"
                   description: "Only fill this in if the employer has given a firm deadline.
                   Leave blank for open-ended roles."
  country          string select, required. options exactly: Taiwan | China
  cities           string list, required. Label "Cities"
  employerType     string select, required. value/label pairs:
                     kindergarten     -> "Kindergarten"
                     primary          -> "Primary school"
                     university       -> "University"
                     language-school  -> "Language school / training centre"
  vacancies        number, optional. Label "Number of vacancies"
  studentAges      string, optional. Label "Age of students"        e.g. "3–12 years"
  classSize        string, optional. Label "Class size"             e.g. "20–30 students"
  salary           object (NOT a list). Label "Salary". Sub-fields:
                     min       number, required. Label "Salary from"
                     max       number, optional. Label "Salary up to"
                     currency  string select, required. options exactly: TWD | RMB
                     period    string select, required. value/label: month -> "Per month", hour -> "Per hour"
                     afterTax  boolean. Label "Is this figure after tax?"
  teachingHours    string, optional. Label "Teaching hours"
  officeHours      string, optional. Label "Office hours"
  schedule         string, optional. Label "Working pattern"
  requirements     object (NOT a list). Label "Requirements". Sub-fields:
                     degree      string select, required. value/label pairs:
                       bachelors              -> "Bachelor's degree"
                       bachelors-or-above     -> "Bachelor's degree or above"
                       bachelors-or-associate -> "Bachelor's degree or US Associate degree"
                       masters                -> "Master's degree"
                       none                   -> "No degree required"
                     tefl        boolean. Label "TEFL/TESOL certificate required?"
                     experience  string, optional. Label "Experience required"
                     passports   string list rendered as a CHECKBOX GROUP, options exactly:
                                 UK | Ireland | US | Canada | Australia | New Zealand | South Africa
  benefits         string list. Label "Benefits"
  visaSupport      string, optional. Label "Visa support"
  startDates       string, optional. Label "Start dates"
  body             rich-text with isBody: true. Label "Full description"

There is NO separate 'slug' field — the filename IS the slug (PLAN §5: "Barry never sees or types a slug").
`

const JOBS = `
THE TEN LISTINGS. Source of truth is ${REPO}/site-capture.md §3 (line 115 onwards).
Filenames are FIXED and PERMANENT (site-capture "Suggested slugs"):
  §3.0 -> content/jobs/taiwan-english-teachers.mdx
  §3.1 -> content/jobs/guangzhou-primary-school.mdx
  §3.2 -> content/jobs/shenzhen-kindergarten-primary.mdx
  §3.3 -> content/jobs/nanjing-weifang-lianyungang.mdx
  §3.4 -> content/jobs/hangzhou-english-teachers.mdx
  §3.5 -> content/jobs/shanghai-boutique-school.mdx
  §3.6 -> content/jobs/foshan-primary-school.mdx
  §3.7 -> content/jobs/kindergarten-six-cities.mdx
  §3.8 -> content/jobs/chengdu-kindergarten.mdx
  §3.9 -> content/jobs/china-university-positions.mdx

TRANSCRIPTION RULES — these matter more than anything else in this task:
1. NEVER invent a fact, figure, benefit or requirement that is not in site-capture.md. If the capture
   does not state something, OMIT the field. Do not guess vacancies, ages or hours.
2. NEVER summarise away detail. PLAN §5: "The salary and benefits granularity is this site's biggest
   differentiator against generic TEFL job boards and must not be summarised away."
3. Structured frontmatter carries the headline facts; the rich-text body carries EVERYTHING ELSE —
   onboarding detail, curriculum notes, duties, the Shanghai school's story. Every bullet in the
   capture must survive either into a frontmatter field or into the body. Nothing is dropped.
4. Salary: store the raw number, not the "17-25k" shorthand. "17-25k" RMB/month => min 17000, max 25000.
   Set afterTax true ONLY where the capture explicitly says after-tax; false where it says before tax
   or is silent.
5. Do NOT carry over "Accredited by the Australian Government" (it appears nowhere in §3, but if you
   see it anywhere, it is a banned claim — CLAUDE.md guardrail 3).
6. Do NOT put the "To apply please email your CV to info@arunlanguagetraining.com" line in the body —
   the apply panel is a page component built in a later step. Leave it out entirely.
7. British English: normalise American spellings in the prose (recognized -> recognised,
   program -> programme, enrollment -> enrolment). Preserve ALL facts, figures, currency amounts,
   proper nouns and structure exactly. Spelling only.
8. Body markdown: use bold sub-headings and bullet lists mirroring the capture's own structure.
   Do not add headings the capture does not have. No H1 in the body (the page renders the title).
9. postedDate: the capture gives no dates. Use 2026-08-01 (the crawl date) for every listing, in
   ISO format. closingDate: omit for all ten — no listing states a deadline.
10. YAML frontmatter must be valid: quote strings containing colons, en-dashes are fine, use
    proper YAML lists. Body follows the closing --- .
`

phase('Build')

const WORK = [
  {
    key: 'tina-config',
    build: `Write ${REPO}/tina/config.ts — the TinaCMS schema for this project. This single file is the
subject of ⛔ CHECKPOINT B, the screen the site owner (Barry, non-technical, 60s) lives in. Field UX
quality is the entire point of this task.

FIRST: read ${REPO}/PLAN.md section 5 (lines 83-129) and section 10 (lines 266-278) in full. Then read
${REPO}/CLAUDE.md. Then check the CURRENT TinaCMS docs at https://tina.io/docs for the defineConfig
shape — the installed version is tinacms 3.12.0 / @tinacms/cli 2.6.0 (published Aug 2026) and the
App Router guidance has moved across versions, so verify rather than recalling. Use WebFetch/WebSearch.

${FIELDS}

BEYOND the field list, PLAN §5 "Field UX" demands ALL of the following — every one is required:
- Every field has a plain-English \`label\` ("Monthly salary (before tax)", never "salary.min").
- Every non-obvious field has a \`description\` acting as a hint, written FOR BARRY, e.g. for benefits:
  "e.g. accommodation provided, flights reimbursed, health insurance". Write these in warm plain
  English, no jargon, British spelling. This is the highest-value part of the file.
- \`ui.defaultItem\` on the collection so a NEW job starts half-filled, not blank: active on,
  postedDate defaulting to today, country/currency paired sensibly (China+RMB), period 'month'.
- \`ui.defaultItem\` on list fields where it helps.
- \`required: true\` on genuinely required fields so the form validates.
- Selects/toggles/checkbox groups instead of free text wherever the value is a known set.
- \`ui.filename.slugify\` generating the slug from the title, AND the filename made read-only after
  creation so a later title edit can NEVER rename the file or change the URL (PLAN §5 + CLAUDE.md
  guardrail 8: job slugs are permanent — renaming breaks Google Jobs and inbound links). Verify the
  exact API for this in the current Tina docs.

Config-level requirements:
- branch from env (NEXT_PUBLIC_TINA_BRANCH / HEAD / VERCEL_GIT_COMMIT_REF fallback chain), clientId
  and token from env — NEVER hardcode secrets (CLAUDE.md guardrail 6). Local mode must work with all
  three unset.
- build: { outputFolder: 'admin', publicFolder: 'public' }
- media: git media store, publicFolder 'public', mediaRoot something like 'images/uploads'.
- Comment the file with // PLAN §5 / // PLAN §10 citations against the decisions they implement.
- The file must typecheck under strict TypeScript.

If you hit a genuine ambiguity between PLAN §5 and what the current Tina API supports, implement the
closest faithful thing and leave a clearly-marked // CHECKPOINT B NOTE: comment explaining the
tension. Do not silently deviate.

Return a summary: the decisions you made, anything you could not implement as specified, and every
CHECKPOINT B NOTE you left.`,
    verify: `Adversarially review ${REPO}/tina/config.ts against its specification. Read PLAN.md §5
(lines 83-129) and §10 (lines 266-278), then read the config file.

${FIELDS}

Check, and report each as PASS or FAIL with evidence:
1. Every field in the spec above exists, with EXACTLY the specified frontmatter key name, type and
   option values. List any mismatch precisely (expected vs actual).
2. Every field has a plain-English label. Flag any label that leaks a code identifier.
3. Descriptions/hints exist and are genuinely useful to a non-technical 60-year-old. Flag any that are
   missing, or that are technical jargon rather than help. Quote the weak ones.
4. ui.defaultItem exists and makes a new job start half-filled (active on, postedDate today,
   country/currency paired, period month).
5. required: true is on the genuinely-required fields and NOT on optional ones (closingDate,
   vacancies, studentAges, classSize, officeHours must NOT be required).
6. The filename/slug is auto-generated from the title AND cannot change after creation. This is
   CLAUDE.md guardrail 8 — a permanent-URL guarantee. Verify against the current Tina docs
   (https://tina.io/docs, tinacms 3.12.0) that the API used actually achieves this. Use WebFetch.
7. No hardcoded secrets, clientId or token. Local mode works with env unset.
8. British English in all labels and descriptions.
9. It will typecheck under strict TS (check imports, types, obvious errors).

Be genuinely adversarial — your job is to find what is wrong, not to confirm it is fine. Report every
defect with file:line. If it is all correct, say so plainly.`,
  },
  {
    key: 'jobs-a',
    build: `Transcribe FOUR job listings from site-capture.md §3 into Tina MDX content files.
Read ${REPO}/site-capture.md lines 115-250 for your four listings, and ${REPO}/CLAUDE.md.

${FIELDS}

${JOBS}

YOUR FOUR FILES ONLY (do not touch any other file):
  §3.0 (site-capture line 124) -> content/jobs/taiwan-english-teachers.mdx
  §3.1 (line 167)              -> content/jobs/guangzhou-primary-school.mdx
  §3.2 (line 183)              -> content/jobs/shenzhen-kindergarten-primary.mdx
  §3.3 (line 209)              -> content/jobs/nanjing-weifang-lianyungang.mdx

Orchestrator's pre-resolved decisions for your four (apply these):
- taiwan-english-teachers: country Taiwan, employerType language-school, salary min 650 max 800
  currency TWD period hour afterTax false. The NT$3000/month teaching-duties stipend and the renewal
  bonuses are BENEFITS and body detail, not the salary field. degree bachelors-or-associate.
  passports: UK, US, Canada, Australia, New Zealand, Ireland (NOT South Africa — the Taiwan visa note
  above the listing omits it). tefl false (the capture says a Bachelor's degree holder does not need
  one; put the Associate-degree nuance in requirements.experience and the body).
- guangzhou-primary-school: China, primary, 17000-25000 RMB month afterTax false, vacancies 1,
  classSize "40 students", degree bachelors, tefl true.
- shenzhen-kindergarten-primary: China, 19000-23000 RMB month afterTax false (capture says
  "before tax"), degree bachelors, tefl true, teachingHours "18 hours per week (24 lessons or fewer)".
  NOTE: this listing spans BOTH kindergarten and primary schools but PLAN §5 specifies employerType as
  a single select. Set it to kindergarten (title order) and say so in your returned summary so the
  orchestrator can raise it at Checkpoint B.
- nanjing-weifang-lianyungang: China, language-school (co-teachers, demonstration classes, sign-up
  commission), 14000-18000 RMB month afterTax TRUE (capture says "(After-Tax)"), studentAges
  "3–12 years", teachingHours "20–25 hours per week", officeHours "15–20 hours per week",
  degree bachelors-or-above, tefl true (TEFL/TESOL/CELTA or 2 years' experience — nuance into
  requirements.experience). passports: US, Australia, Canada, UK, Ireland, New Zealand.

Return a summary listing, per file: the frontmatter you set, and anything in the capture you were
unsure how to place. Flag ANY place you were tempted to invent a value.`,
    verify: `Adversarial fidelity check. Compare four transcribed job files against the source capture,
line by line. Read ${REPO}/site-capture.md lines 115-250 (the source) and then these four files:
  ${REPO}/content/jobs/taiwan-english-teachers.mdx        (source §3.0, capture line 124)
  ${REPO}/content/jobs/guangzhou-primary-school.mdx       (source §3.1, capture line 167)
  ${REPO}/content/jobs/shenzhen-kindergarten-primary.mdx  (source §3.2, capture line 183)
  ${REPO}/content/jobs/nanjing-weifang-lianyungang.mdx    (source §3.3, capture line 209)

${FIELDS}

Your job is to catch FABRICATION and LOSS. For each file report:
A. INVENTED CONTENT — any fact, figure, benefit, requirement, city, age range or claim in the file
   that is NOT in the capture. This is the most serious defect class (CLAUDE.md guardrail 3:
   "No invented copy"). Quote the invented text and confirm its absence from the source.
B. LOST CONTENT — any bullet, figure, benefit or detail in the capture that appears in NEITHER the
   frontmatter NOR the body. PLAN §5 forbids summarising the salary/benefits granularity away.
   List every dropped item verbatim.
C. ALTERED FIGURES — every number, currency amount, hour count, class size and age range must match
   the source exactly. Check each one. "17-25k" must be min 17000 max 25000.
D. afterTax correctness — true ONLY where the capture explicitly says after-tax.
E. Valid YAML frontmatter, field names exactly matching the spec above, filenames exactly as listed.
F. The apply line "To apply please email your CV to info@arunlanguagetraining.com" must NOT appear.
G. British spelling normalisation applied to prose, with all facts/figures/proper nouns untouched.

Be ruthless. Report every defect with file and quoted text. Do not fix anything — report only.`,
  },
  {
    key: 'jobs-b',
    build: `Transcribe THREE job listings from site-capture.md §3 into Tina MDX content files.
Read ${REPO}/site-capture.md lines 247-395 for your three listings, and ${REPO}/CLAUDE.md.

${FIELDS}

${JOBS}

YOUR THREE FILES ONLY (do not touch any other file):
  §3.4 (site-capture line 247) -> content/jobs/hangzhou-english-teachers.mdx
  §3.5 (line 287)              -> content/jobs/shanghai-boutique-school.mdx
  §3.6 (line 333)              -> content/jobs/foshan-primary-school.mdx

Orchestrator's pre-resolved decisions for your three (apply these):
- hangzhou-english-teachers: China, employerType language-school, cities Hangzhou plus the "other
  cities in Zhejiang" note (put the note in the body, not as a fake city), vacancies 60,
  salary 15000-20000 RMB month afterTax false, teachingHours "20 hours per week",
  officeHours "8:00am–5:00pm, Monday to Friday", classSize "20–30 students",
  studentAges "3–12 years", degree bachelors-or-associate (capture: "Bachelor's degree or higher, or
  Diploma or US Associate's degree in Childhood Education" — put the Childhood Education specificity
  in requirements.experience and the body), tefl false (free TEFL is PROVIDED — that is a benefit,
  not a requirement; make sure you do not confuse the two). The capture gives NO passport list for
  this listing — leave requirements.passports OFF entirely rather than inventing one.
- shanghai-boutique-school: China, language-school, cities Shanghai, salary 20000-25000 RMB month
  afterTax TRUE, teachingHours "16–22 hours per week", schedule "Evenings and weekends, two weekdays
  off", classSize "4–8 students", studentAges "3–12 years", degree bachelors-or-above, tefl false
  (capture says "TEFL qualification preferred (we can help)" — preferred is not required; the nuance
  goes in requirements.experience), requirements.experience should capture the 1-3 years / two years
  points. passports: UK, Ireland, US, Canada, New Zealand, Australia, South Africa.
  This listing has the school's own story ("We are a boutique English language school... started in
  2013") and its curriculum detail (Longman Pearson, Tot Talk, Welcome to English, Side by Side) —
  PLAN §5 explicitly names "the Shanghai school's story" as body content that must survive. Keep all
  of it, including the closing paragraph about 30-32k after tax in practice.
- foshan-primary-school: China, primary, cities "Shunde District, Foshan City" (or Foshan with the
  district in the body), vacancies 8, salary 17000-23000 RMB month afterTax false,
  classSize "40 students", studentAges "7–12 years", schedule "Monday to Friday, weekends off",
  degree bachelors, tefl true. passports: UK, Ireland, Canada, New Zealand, US, Australia.

Return a summary listing, per file: the frontmatter you set, and anything in the capture you were
unsure how to place. Flag ANY place you were tempted to invent a value.`,
    verify: `Adversarial fidelity check. Compare three transcribed job files against the source capture,
line by line. Read ${REPO}/site-capture.md lines 247-395 (the source) and then these three files:
  ${REPO}/content/jobs/hangzhou-english-teachers.mdx  (source §3.4, capture line 247)
  ${REPO}/content/jobs/shanghai-boutique-school.mdx   (source §3.5, capture line 287)
  ${REPO}/content/jobs/foshan-primary-school.mdx      (source §3.6, capture line 333)

${FIELDS}

Your job is to catch FABRICATION and LOSS. For each file report:
A. INVENTED CONTENT — any fact, figure, benefit, requirement, city, age range or claim in the file
   that is NOT in the capture. Most serious defect class (CLAUDE.md guardrail 3). Quote it and
   confirm its absence from the source. PAY SPECIAL ATTENTION to hangzhou-english-teachers: the
   capture gives it no passport/nationality list, so any passports value there is fabricated.
B. LOST CONTENT — any bullet, figure, benefit or detail in the capture that appears in NEITHER the
   frontmatter NOR the body. For shanghai-boutique-school specifically, PLAN §5 names "the Shanghai
   school's story" as content that must survive: check the 2013 founding, the five "set us apart"
   points, the Longman Pearson curriculum names, and the closing 30-32k paragraph are all present.
   The Hangzhou listing has a ~20-item benefits list — check every item survived.
C. ALTERED FIGURES — every number, currency amount, hour count, class size and age range must match
   exactly. Check each one.
D. TEFL CONFUSION — a listing that PROVIDES free TEFL (Hangzhou) must not have tefl: true, and a
   listing where TEFL is "preferred" (Shanghai) must not have tefl: true. Verify both.
E. afterTax correctness — true ONLY where the capture explicitly says after-tax. Shanghai and
   Hangzhou differ here; check both.
F. Valid YAML frontmatter, field names exactly matching the spec, filenames exactly as listed.
G. The apply line "To apply please email your CV to info@arunlanguagetraining.com" must NOT appear.
H. British spelling normalisation applied to prose, facts/figures/proper nouns untouched.

Be ruthless. Report every defect with file and quoted text. Do not fix anything — report only.`,
  },
  {
    key: 'jobs-c',
    build: `Transcribe THREE job listings from site-capture.md §3 into Tina MDX content files.
Read ${REPO}/site-capture.md lines 361-447 for your three listings, and ${REPO}/CLAUDE.md.

${FIELDS}

${JOBS}

YOUR THREE FILES ONLY (do not touch any other file):
  §3.7 (site-capture line 361) -> content/jobs/kindergarten-six-cities.mdx
  §3.8 (line 394)              -> content/jobs/chengdu-kindergarten.mdx
  §3.9 (line 416)              -> content/jobs/china-university-positions.mdx

Orchestrator's pre-resolved decisions for your three (apply these):
- kindergarten-six-cities: China, kindergarten, cities exactly the six named at the foot of the
  listing (Shanghai, Beijing, Wuhan, Shenzhen, Guangzhou, Nanjing), salary 15000-20000 RMB month
  afterTax false (capture says "before tax"), studentAges "3–6 years", classSize "15 students",
  officeHours "8:00am–5:30pm, Monday to Friday, with a two-and-a-half hour break at midday",
  teachingHours "No more than 20 classes per week", degree bachelors, tefl true.
  passports: US, UK, Canada, Australia, New Zealand, Ireland. The housing allowance, renewal bonus
  and visa reimbursement are BENEFITS — they are not part of the base salary figure.
- chengdu-kindergarten: China, kindergarten, cities Chengdu, salary 21000-23000 RMB month
  afterTax TRUE, studentAges "3–6 years", classSize "20–28 students",
  schedule "7:40–12:10 and 14:00–17:30, Monday to Friday", degree bachelors, tefl false (the capture
  lists no TEFL requirement for this one — do not add one), requirements.experience should carry
  "Teaching experience is advantageous but not mandatory".
  passports: US, UK, Ireland, Canada, Australia, New Zealand.
  The "Exploratory Theme-Based Teaching Curriculum" paragraph and the three-in-one teaching team
  detail are body content and must survive in full.
- china-university-positions: China, university, cities the five/six named (Harbin, Jinan,
  Qinghuangdao, Qingdao, Taizhou, Nanjing), salary 16000-26000 RMB month afterTax false,
  teachingHours "20–21 hours face-to-face teaching per week", officeHours "17–18 hours per week",
  degree bachelors-or-above, tefl true (CELTA/TEFL/TESOL required),
  requirements.experience carries the one-year EAP and online-teaching preferences.
  passports: UK, Canada, US, Ireland, Australia, New Zealand.
  vacancies: the capture gives a per-city breakdown (Harbin ×1, Jinan ×3, Qinghuangdao ×2, Qingdao ×1,
  Taizhou & Nanjing ×1) totalling 8. Set vacancies 8 AND preserve the per-city breakdown verbatim in
  the body — do not lose it.
  The six "Responsibilities" bullets and the "38 hours weekly" total must survive in the body.

Return a summary listing, per file: the frontmatter you set, and anything in the capture you were
unsure how to place. Flag ANY place you were tempted to invent a value.`,
    verify: `Adversarial fidelity check. Compare three transcribed job files against the source capture,
line by line. Read ${REPO}/site-capture.md lines 361-447 (the source) and then these three files:
  ${REPO}/content/jobs/kindergarten-six-cities.mdx   (source §3.7, capture line 361)
  ${REPO}/content/jobs/chengdu-kindergarten.mdx      (source §3.8, capture line 394)
  ${REPO}/content/jobs/china-university-positions.mdx (source §3.9, capture line 416)

${FIELDS}

Your job is to catch FABRICATION and LOSS. For each file report:
A. INVENTED CONTENT — any fact, figure, benefit, requirement, city, age range or claim NOT in the
   capture. Most serious defect class (CLAUDE.md guardrail 3). Quote it and confirm its absence.
   Check especially: chengdu-kindergarten has NO TEFL requirement in the source — tefl must be false
   and no TEFL requirement may appear in the body.
B. LOST CONTENT — any bullet, figure, benefit or detail in the capture appearing in NEITHER the
   frontmatter NOR the body. Check specifically:
   - chengdu: the "Exploratory Theme-Based Teaching Curriculum" paragraph in full, and the
     three-in-one teaching team / dual-class teacher system detail.
   - china-university-positions: all six Responsibilities bullets, the "38 hours weekly" total, and
     the per-city vacancy breakdown (Harbin ×1, Jinan ×3, Qinghuangdao ×2, Qingdao ×1,
     Taizhou & Nanjing ×1).
   - kindergarten-six-cities: the company-support list (visa guidance, airport pick-up, hotel
     arrangement, city life intro) and every salary/benefit line.
   List every dropped item verbatim.
C. ALTERED FIGURES — every number, currency amount, hour count, class size, age range and vacancy
   count must match exactly. Check each one.
D. afterTax correctness — chengdu is after-tax, kindergarten-six-cities is explicitly before tax.
   Verify both.
E. CITY LISTS — verify the cities arrays against the source. china-university-positions names Harbin
   in the body even though the section title omits it; check it was not lost.
F. Valid YAML frontmatter, field names exactly matching the spec, filenames exactly as listed.
G. The apply line "To apply please email your CV to info@arunlanguagetraining.com" must NOT appear.
H. British spelling normalisation applied to prose ("recognized" -> "recognised", "programs" ->
   "programmes"), facts/figures/proper nouns untouched.

Be ruthless. Report every defect with file and quoted text. Do not fix anything — report only.`,
  },
  {
    key: 'static-pages',
    build: `Build three schema-independent files for this site. These do NOT depend on the Tina content
model, which is why they can be built now. Read ${REPO}/CLAUDE.md and ${REPO}/PLAN.md §4 (lines 50-82)
and §6 (lines 130-151) first.

${HOUSE}

FILE 1 — ${REPO}/app/privacy/page.tsx
The privacy policy, ported VERBATIM from ${REPO}/site-capture.md §5 (line 473 onwards). CLAUDE.md
guardrail 3 says: "port /privacy verbatim". Rules:
- Reproduce the policy text faithfully. Do NOT rewrite, modernise, summarise or improve it.
- Do NOT use dangerouslySetInnerHTML (CLAUDE.md guardrail 5). Render as JSX elements.
- Where the old policy is plainly wrong for the NEW site (e.g. references to cookies, analytics or
  data collection the new site does not do — the new site has no cookies, no cookie banner and no
  CV uploads, per CLAUDE.md guardrail 4), do NOT silently edit it. Leave the text and add a clearly
  marked {/* TODO(PLAN §6): ... */} JSX comment naming the discrepancy. PLAN step 5 says
  "/privacy (verbatim + TODO)" — the TODOs are expected deliverables, not sloppiness.
- Add a page-level \`export const metadata\` with a title and description, matching the pattern in
  the existing app/layout.tsx.
- Match the visual language of the existing pages: read app/page.tsx and app/styleguide/page.tsx and
  reuse the same container/section/prose patterns and design tokens. Long-form legal text needs a
  constrained measure (~65-70ch) for readability.
- Semantic HTML: one h1, h2s for the policy's own sections, real lists.

FILE 2 — ${REPO}/app/not-found.tsx
The custom 404 (PLAN §4: /404 custom not-found page). It must:
- Be a Next.js App Router not-found file (default export, named NotFound).
- Explain in plain, warm British English that the page has moved or no longer exists.
- Offer useful next steps: the job index (/jobs), the home page (/), and contact (/contact).
  Use the existing Button component and components/nav.ts if it fits — read them first.
- Note in a comment that /gdpr-consent intentionally 404s here (PLAN §4).
- Use design tokens only. Match the house visual style.
- Be reachable and accessible: real h1, focusable links, AA contrast.

FILE 3 — ${REPO}/public/_redirects
The Cloudflare redirects file. PLAN §4 (lines 50-82) gives the EXACT table of ten 301 redirects —
transcribe it precisely, do not improvise paths. Also add the /admin directory-index line that
PLAN §10 (line 266-268) calls for:  /admin  /admin/index.html  200
Add a brief comment header citing PLAN §4. Do NOT add a catch-all or any redirect not in the plan.
Note in a comment that /gdpr-consent is deliberately left dead (PLAN §4).

Do not create any other files. Do not touch app/page.tsx, app/layout.tsx or app/globals.css.
Return a summary: what you built, every TODO you left in the privacy page and why, and any point
where the old privacy copy conflicts with the new site's architecture.`,
    verify: `Adversarially review three files against their specs. Read ${REPO}/PLAN.md §4 (lines 50-82),
${REPO}/site-capture.md §5 (line 473 onwards) and §6 (line 600 onwards), and ${REPO}/CLAUDE.md. Then
review:
  ${REPO}/app/privacy/page.tsx
  ${REPO}/app/not-found.tsx
  ${REPO}/public/_redirects

Report each as PASS or FAIL with evidence:
1. PRIVACY FIDELITY — is the policy text actually verbatim from site-capture §5? Diff it mentally
   paragraph by paragraph. Report ANY rewritten, dropped, softened or added sentence with quotes.
   This is CLAUDE.md guardrail 3 ("port /privacy verbatim").
2. No dangerouslySetInnerHTML anywhere (guardrail 5).
3. The TODO comments exist where the old policy conflicts with the new architecture (no cookies,
   no analytics beyond the Cloudflare beacon, no CV uploads, no third-party asset hosts). Flag
   conflicts that were silently edited instead of TODO-flagged — silent editing is the failure mode.
4. REDIRECTS — check all ten paths and targets character-by-character against PLAN §4 lines 55-70.
   Report any typo, missing line, extra line, or wrong status code. Confirm the /admin 200 line is
   present and confirm /gdpr-consent is NOT redirected (it must stay dead).
5. DESIGN TOKENS — no raw hex values, no arbitrary Tailwind values like text-[17px] in either .tsx.
   Read app/globals.css for the legitimate token names and verify every colour/size class used
   actually exists as a token. Report any invented class name.
6. British English throughout the new prose.
7. Accessibility: single h1 per page, semantic landmarks/lists, meaningful link text (no "click
   here"), no positive tabindex.
8. Named vs default exports follow the convention (route files default-export; anything in
   components/ must be a named export).
9. Both .tsx files will typecheck under strict TS and pass eslint (check imports resolve, no unused
   vars, no missing keys on mapped elements).

Be genuinely adversarial. Report every defect with file:line and quoted text. Do not fix — report only.`,
  },
]

const results = await pipeline(
  WORK,
  (item) => agent(item.build, {
    label: `build:${item.key}`,
    phase: 'Build',
    agentType: 'general-purpose',
  }),
  (buildSummary, item) => agent(item.verify, {
    label: `verify:${item.key}`,
    phase: 'Verify',
    agentType: 'general-purpose',
  }).then((verdict) => ({ key: item.key, buildSummary, verdict })),
)

phase('Reconcile')

const reconcile = await agent(
  `Final cross-check before ⛔ CHECKPOINT B. Two independent teams have just written a TinaCMS schema
and ten content files from a shared spec, WITHOUT seeing each other's work. Your job is to prove they
actually agree, because a mismatch means the CMS silently drops Barry's data.

Read ${REPO}/tina/config.ts and ALL TEN files in ${REPO}/content/jobs/.

${FIELDS}

Report precisely:
1. FIELD NAME AGREEMENT — build the set of every frontmatter key used across the ten .mdx files, and
   the set of every field name declared in tina/config.ts. Report:
   a) keys present in content files but MISSING from the schema (Tina will drop these on save — the
      most damaging failure mode),
   b) fields in the schema never used by any content file (fine, but list them),
   c) any spelling/casing difference between the two.
   Do the same for nested object sub-fields: salary.{min,max,currency,period,afterTax} and
   requirements.{degree,tefl,experience,passports}.
2. ENUM VALUE AGREEMENT — for every select/checkbox field (country, employerType, salary.currency,
   salary.period, requirements.degree, requirements.passports), list every distinct value that
   actually appears across the ten content files, and confirm each is a declared option in the
   schema. Report any value the schema would reject. Exact string match, including case and hyphens.
3. TYPE AGREEMENT — salary.min/max and vacancies must be YAML numbers (not quoted strings); active,
   salary.afterTax and requirements.tefl must be YAML booleans; cities, benefits and
   requirements.passports must be YAML lists. Report any file where the YAML type is wrong.
4. FILENAME CHECK — confirm exactly these ten filenames exist and nothing else is in content/jobs/:
   taiwan-english-teachers, guangzhou-primary-school, shenzhen-kindergarten-primary,
   nanjing-weifang-lianyungang, hangzhou-english-teachers, shanghai-boutique-school,
   foshan-primary-school, kindergarten-six-cities, chengdu-kindergarten, china-university-positions
   (all .mdx).
5. YAML VALIDITY — parse each file's frontmatter mentally and report any file that would fail to
   parse (unquoted colons, bad indentation, unescaped quotes, a body not separated by ---).
6. REQUIRED-FIELD COVERAGE — every field the schema marks required: true must be present and
   non-empty in all ten content files. List any omission.

Do NOT fix anything. Return a precise defect list the orchestrator can act on, ordered most-damaging
first. If everything agrees, say so explicitly and state what you checked.`,
  { label: 'reconcile:schema-vs-content', phase: 'Reconcile', agentType: 'general-purpose' },
)

return { results, reconcile }
