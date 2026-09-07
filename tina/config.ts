import { defineConfig } from 'tinacms'

/**
 * TinaCMS schema — the content model for the whole site (PLAN §5).
 *
 * This file is what Barry actually lives in: he logs in at /admin, fills labelled
 * fields and clicks save. Every label and description below is written for him,
 * not for us. Nothing here should require knowing what a slug, a branch or a
 * commit is (CLAUDE.md — "the two users").
 *
 * Verified against tinacms 3.12.0 / @tinacms/cli 2.6.0 (Aug 2026).
 */

/*
 * ── CHECKPOINT B NOTES ──────────────────────────────────────────────────────
 * Places where PLAN §5 and the tinacms 3.12 API don't line up exactly. Each was
 * implemented as the closest faithful thing; none is a silent deviation.
 *
 * CHECKPOINT B NOTE 1 — `ui.defaultItem` is not in the published `UICollection`
 *   type, though the admin reads it (the create-document form does
 *   `template.ui?.defaultItem || template?.defaultItem`, and a fields-based
 *   collection is its own template). The alternative, collection-level
 *   `defaultItem`, IS typed but is marked @deprecated. Kept `ui.defaultItem` as
 *   the plan asks and widened the type locally — see `jobCollectionUI` below.
 *
 * CHECKPOINT B NOTE 2 — the spec calls postedDate "string, with
 *   ui.dateFormat". In 3.12 `ui.dateFormat` exists only on `type: 'datetime'`;
 *   a string field with it would neither typecheck nor render a date picker.
 *   Used `datetime`, which still stores a plain string in the frontmatter, so the
 *   existing `postedDate: "2026-08-01"` values in content/jobs keep working.
 *   Consumers beware: the picker writes a full ISO timestamp
 *   ("2026-08-23T00:00:00.000Z"), so pages must format the value through
 *   `Date`, not assume the shorthand form. (closingDate was dropped in the
 *   2 Sep 2026 pivot — no content file ever used it.)
 *
 * CHECKPOINT B NOTE 3 — `ui.filename.readonly` makes the filename read-only
 *   always, not only after creation; 3.12 has no "lock it once saved" option.
 *   That is stricter than PLAN §5 asks and is the right side to err on: the
 *   slugify callback still fills the filename in as Barry types the title, so he
 *   never types or sees a slug either way (PLAN §5), and it can never be edited
 *   afterwards (CLAUDE.md guardrail 8). The one other rename route is the Rename
 *   item in the job-list menu, which 3.12 gates on `allowedActions.delete` — so
 *   `delete: false` closes it and enforces guardrail 10 at the same time.
 *
 * CHECKPOINT B NOTE 4 — "`ui.defaultItem` on list fields where it helps": in
 *   3.12 a field-level `defaultItem` only exists for lists of objects. Every list
 *   here (cities, benefits, passports) is a list of strings or a checkbox group,
 *   where a new item is an empty string by definition and there is nothing
 *   sensible to seed. The collection-level `ui.defaultItem` does the real work.
 *
 * CHECKPOINT B NOTE 5 — `salary` and `requirements` are not themselves marked
 *   `required`. Their required sub-fields carry the validation; marking a
 *   non-list object required adds nothing to the form and risks Tina complaining
 *   about an object that is present but only partly filled.
 *
 * CHECKPOINT B NOTE 6 — no `ui.router` here. That switches the admin into
 *   contextual (in-page) editing, which PLAN §10 leaves as a judgement call once
 *   the job pages exist and can be tried for real. Adding it now would give Barry
 *   a preview pane that looks editable but isn't. Revisit with the job pages.
 * ────────────────────────────────────────────────────────────────────────────
 */

// PLAN §10 — branch comes from the environment so local mode works with nothing set.
// TinaCloud is wired last, as pure config; no secret is ever written into this file
// (CLAUDE.md guardrail 6). With all of these unset, `tinacms dev` runs in local mode.
const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH || // set explicitly if we ever need to override
  process.env.CF_PAGES_BRANCH || // Cloudflare Pages, where this site deploys (PLAN §3)
  process.env.HEAD || // Netlify
  process.env.VERCEL_GIT_COMMIT_REF || // Vercel
  ''

/**
 * PLAN §5 — "Barry never sees or types a slug." The filename is generated from the
 * job title, and the filename IS the URL: content/jobs/<name>.mdx → /jobs/<name>.
 * There is deliberately no `slug` field.
 */
const slugifyTitle = (title: string): string =>
  title
    .normalize('NFKD') // strip accents so "Xi'an" style titles stay ASCII
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '') // don't leave a gap where an apostrophe was
    .replace(/[^a-z0-9]+/g, '-') // em dashes, commas, spaces → one hyphen
    .replace(/^-+|-+$/g, '')

/**
 * The published `UICollection` type doesn't declare `defaultItem`, but the admin
 * reads it at runtime (`template.ui?.defaultItem || template?.defaultItem` in
 * tinacms 3.12's create-document form, where a fields-based collection *is* its own
 * template). Widening the type locally keeps `ui.defaultItem` — which is what the
 * current docs recommend — while staying strict-TypeScript clean.
 * See CHECKPOINT B NOTE 1 above.
 */
type CollectionUI = NonNullable<
  Parameters<typeof defineConfig>[0]['schema']['collections'][number]['ui']
>

const jobCollectionUI: CollectionUI & {
  defaultItem?: () => Record<string, unknown>
} = {
  filename: {
    // PLAN §5 — generate the slug from the title…
    slugify: (values) =>
      slugifyTitle(typeof values?.title === 'string' ? values.title : ''),
    // …and never let it change afterwards. CLAUDE.md guardrail 8: renaming a job
    // breaks Google Jobs and every inbound link. `readonly` disables the filename
    // field; the slugify callback above still fills it in while the job is being
    // created, so Barry never has to type it and can never overwrite it.
    readonly: true,
    description:
      'This is the web address of the job page. It is made from the job title as you type it, and it stays the same forever so that links and Google listings keep working.',
  },
  // CLAUDE.md guardrail 10 — placements are hidden with the "Show this
  // placement on the website" toggle, never deleted. Turning off `delete` also
  // removes the Rename option from the list (in tinacms 3.12 both menu items
  // are gated on the same flag), which is the second half of guardrail 8.
  allowedActions: {
    create: true,
    delete: false,
  },
  // PLAN §5 — a new job starts half-filled rather than blank.
  defaultItem: () => ({
    active: true,
    postedDate: new Date().toISOString(),
    country: 'China', // nine of the ten live listings are mainland China…
    salary: {
      currency: 'RMB', // …so RMB per month is the sensible pairing
      period: 'month',
      afterTax: false,
    },
    requirements: {
      degree: 'bachelors',
      tefl: false,
    },
  }),
}

export default defineConfig({
  branch,
  // Both are read from the environment only — never hardcoded (CLAUDE.md guardrail 6).
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? '',
  token: process.env.TINA_TOKEN ?? '',

  // PLAN §10 — the admin builds to static files served at /admin/index.html.
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  // PLAN §10 — Tina's git media handler. Uploads land in the repo; no third-party
  // asset host, nothing else to pay for or keep secure (CLAUDE.md guardrail 4).
  media: {
    tina: {
      publicFolder: 'public',
      mediaRoot: 'images/uploads',
    },
  },

  schema: {
    collections: [
      {
        name: 'job',
        label: 'Placements',
        path: 'content/jobs',
        format: 'mdx',
        ui: jobCollectionUI,
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Job title',
            description:
              'Name the role and the place, the way a teacher would search for it — for example "Kindergarten teachers in Chengdu". These are placements you have already made, so leave out "needed", "vacancies" or "required". This is the heading on the page and the line Google shows.',
            required: true,
            isTitle: true, // so the job list shows titles, not filenames
          },
          {
            type: 'boolean',
            name: 'active',
            label: 'Show this placement on the website',
            description:
              'Turn this off to take a placement off the website lists. Its page stays reachable at the same address — never delete a placement.',
          },
          {
            // Amended 2 Sep 2026: the listings are a record of filled
            // placements, so this date is when the placement was (roughly)
            // made. The site shows only the month and year and sorts newest
            // first. The frontmatter key stays `postedDate` — renaming it
            // would mean migrating all ten content files for no visitor-
            // visible gain.
            type: 'datetime',
            name: 'postedDate',
            label: 'When was the role filled?',
            description:
              'Roughly is fine — the website only shows the month and year, and lists the newest placements first.',
            required: true,
            ui: {
              dateFormat: 'D MMMM YYYY',
              timeFormat: false, // a date is enough; no need to make him pick a time
            },
          },
          {
            type: 'string',
            name: 'country',
            label: 'Country',
            description:
              'Which country the job is in. Candidates filter by this, so it has to be right.',
            required: true,
            options: ['Taiwan', 'China'],
          },
          {
            type: 'string',
            name: 'cities',
            label: 'Cities',
            description:
              'Add one city at a time using the Add Item button. If the same role is open in several places, list them all; candidates can filter by city.',
            required: true,
            list: true,
          },
          {
            type: 'string',
            name: 'employerType',
            label: 'Type of school',
            description: 'Candidates filter by this, so pick the closest match.',
            required: true,
            options: [
              { value: 'kindergarten', label: 'Kindergarten' },
              { value: 'primary', label: 'Primary school' },
              { value: 'university', label: 'University' },
              { value: 'language-school', label: 'Language school / training centre' },
            ],
          },
          {
            type: 'number',
            name: 'vacancies',
            label: 'Number of vacancies',
            description:
              'How many teachers the employer is taking on. Leave blank if you are not sure — nothing is shown if it is empty.',
          },
          {
            type: 'string',
            name: 'studentAges',
            label: 'Age of students',
            description: 'In the employer\'s own words — for example "3–12 years".',
          },
          {
            type: 'string',
            name: 'classSize',
            label: 'Class size',
            description:
              'For example "20–30 students". Small classes are a real selling point, so it is worth filling in.',
          },
          {
            // PLAN §5 — one object, not a list: a job has exactly one salary.
            // GBP approximations are worked out at build time from lib/rates.ts —
            // never a field Barry fills in.
            type: 'object',
            name: 'salary',
            label: 'Salary',
            description:
              'Enter the figure exactly as the employer gives it, in their currency. The website works out the rough pound equivalent for you and labels it "approx.".',
            fields: [
              {
                type: 'number',
                name: 'min',
                label: 'Salary from',
                description:
                  'Numbers only — no commas and no currency symbol. If there is a single fixed figure, put it here and leave "Salary up to" blank.',
                required: true,
              },
              {
                type: 'number',
                name: 'max',
                label: 'Salary up to',
                description: 'The top of the range. Leave blank if the pay is a single figure.',
              },
              {
                type: 'string',
                name: 'currency',
                label: 'Currency',
                description: 'TWD for Taiwan, RMB for mainland China.',
                required: true,
                options: ['TWD', 'RMB'],
              },
              {
                type: 'string',
                name: 'period',
                label: 'Paid per',
                description:
                  'Is the figure above a monthly wage or an hourly rate? Most listings are monthly; the Taiwan hourly roles are the exception.',
                required: true,
                options: [
                  { value: 'month', label: 'Per month' },
                  { value: 'hour', label: 'Per hour' },
                ],
              },
              {
                type: 'boolean',
                name: 'afterTax',
                label: 'Is this figure after tax?',
                description:
                  'Turn this on if the employer quotes take-home pay. The listing then shows an "after tax" badge, which is one of the first things candidates look for.',
              },
            ],
          },
          {
            type: 'string',
            name: 'teachingHours',
            label: 'Teaching hours',
            description:
              'Time actually in front of a class — for example "16–22 hours per week".',
          },
          {
            type: 'string',
            name: 'officeHours',
            label: 'Office hours',
            description:
              'Any time expected at the school on top of teaching — for example "8am–5pm, Monday to Friday".',
          },
          {
            type: 'string',
            name: 'schedule',
            label: 'Working pattern',
            description:
              'The shape of the week in plain words — for example "Monday to Friday, evenings and weekends free" or "Evenings and weekends, two weekdays off".',
          },
          {
            // PLAN §5 — one object, not a list.
            type: 'object',
            name: 'requirements',
            label: 'Requirements',
            description:
              'What a candidate must have before they can apply. Getting this right saves you answering emails from people who are not eligible.',
            fields: [
              {
                type: 'string',
                name: 'degree',
                label: 'Minimum qualification',
                description:
                  'The lowest qualification the employer will accept — not the one they would prefer. If they say a degree "or above", choose the "or above" option.',
                required: true,
                options: [
                  { value: 'bachelors', label: "Bachelor's degree" },
                  { value: 'bachelors-or-above', label: "Bachelor's degree or above" },
                  {
                    value: 'bachelors-or-associate',
                    label: "Bachelor's degree or US Associate degree",
                  },
                  { value: 'masters', label: "Master's degree" },
                  { value: 'none', label: 'No degree required' },
                ],
              },
              {
                type: 'boolean',
                name: 'tefl',
                label: 'TEFL/TESOL certificate required?',
                description:
                  'Turn this on if the employer insists on one. When it is on, the job page offers the candidate our discounted 120-hour course — which is exactly the moment they are most likely to take it up.',
              },
              {
                type: 'string',
                name: 'experience',
                label: 'Experience required',
                description:
                  'For example "Two years\' classroom experience preferred". Leave blank if none is needed.',
              },
              {
                // PLAN §5 — checkbox group, not free text.
                type: 'string',
                name: 'passports',
                label: 'Passports accepted',
                description:
                  'Tick every nationality the employer will accept. This is usually the very first thing a candidate checks, so please do not leave it empty.',
                list: true,
                options: [
                  'UK',
                  'Ireland',
                  'US',
                  'Canada',
                  'Australia',
                  'New Zealand',
                  'South Africa',
                ],
                ui: {
                  component: 'checkbox-group',
                },
              },
            ],
          },
          {
            type: 'string',
            name: 'benefits',
            label: 'Benefits',
            description:
              'Add one benefit at a time using the Add Item button — for example accommodation provided, flights reimbursed, health insurance, contract completion bonus. Keep the employer\'s own figures where they have given them: that detail is what makes our listings better than the big job boards.',
            list: true,
          },
          {
            type: 'string',
            name: 'visaSupport',
            label: 'Visa support',
            description:
              'What the employer does about the work visa — for example "Z visa arranged and paid for".',
          },
          {
            type: 'string',
            name: 'startDates',
            label: 'Start dates',
            description:
              'When the employer wants people to begin — for example "August 2026, or by arrangement".',
          },
          {
            // PLAN §5 — the structured fields above carry the headline facts; this
            // carries everything else. Rendered through Tina's rich-text renderer,
            // never dangerouslySetInnerHTML (CLAUDE.md guardrail 5).
            type: 'rich-text',
            name: 'body',
            label: 'Full description',
            description:
              'Everything else worth saying: the school and its story, the curriculum, what a day looks like, the onboarding help. Headings, bold text and bullet lists are all available from the toolbar.',
            isBody: true,
          },
        ],
      },
    ],
  },
})
