/**
 * Cloudflare Worker — the form relays (PLAN §8.3):
 *
 *   POST /api/contact — the /contact enquiry form
 *   POST /api/profile — the /profile Teacher Profile wizard
 *                       (PLAN amendment 2 Sep 2026 (profile))
 *
 * This is the one piece of the system that is not a static file (CLAUDE.md
 * guardrail 7 exception). It relays each form to Barry's inbox via Resend
 * and stores nothing: no KV, no queue, no message content in logs — the
 * profile flow's CV is forgotten the moment Resend accepts it. Deployed
 * separately from the site build — see worker/README.md.
 *
 * Hardening layers, in request order (PLAN §8.3), shared by both routes:
 *   1. POST only; same-origin Origin/Referer check
 *   2. honeypot field — any value ⇒ silently accept and drop
 *   3. time-trap — submissions under ~3s after render rejected
 *   4. validation + CRLF stripping (mail-header injection); the profile
 *      route adds file size/extension checks and filename sanitising
 *   5. Turnstile server-side verification
 *   6. Resend send: user content in body text only, never in headers
 *      beyond reply_to; from the verified send. subdomain (PLAN §8.4)
 * The Cloudflare zone rate-limit rule (5 req/min/IP on POST /api/*) is
 * configured in the dashboard at deploy time (PLAN §13 step 8).
 */

interface Env {
  /** Secrets — set with `wrangler secret put`, never in the repo (guardrail 6). */
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  /** Plain vars — see wrangler.toml. */
  ALLOWED_ORIGINS: string; // comma-separated, e.g. "https://www.arunlanguagetraining.com"
  TO_EMAIL: string; // info@arunlanguagetraining.com
  FROM_EMAIL: string; // enquiries@send.arunlanguagetraining.com
}

// Field names shared by both forms — must match components/ContactForm.tsx
// and components/ProfileWizard.tsx.
const FIELD_NAME = "name";
const FIELD_EMAIL = "email";
const FIELD_MESSAGE = "message";
const FIELD_HONEYPOT = "website"; // tempting to bots, hidden from people
const FIELD_STARTED = "form_started_at"; // filled by JS at render time
const FIELD_TURNSTILE = "cf-turnstile-response";

const MAX_NAME = 200;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
const MIN_FILL_MS = 3000;

// Profile flow (PLAN amendment 2 Sep 2026 (profile)). Enum value → display
// label; the key set is also the single source of truth for validation.
const JOB_TYPE_LABELS: Record<string, string> = {
  kindergarten: "Kindergarten",
  training_centre: "Training centre",
  primary_school: "Primary school",
  middle_school: "Middle school",
  high_school: "High school",
  university: "University",
};
const DOC_STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
};
const PASSPORT_LABELS: Record<string, string> = {
  uk: "United Kingdom",
  ireland: "Ireland",
  usa: "United States",
  canada: "Canada",
  australia: "Australia",
  new_zealand: "New Zealand",
  south_africa: "South Africa",
  other: "Other",
};
const BACKGROUND_LABELS: Record<string, string> = {
  clean: "Clean",
  disclose: "Has something to disclose — discuss privately",
};
// The wizard forks on this answer (Taiwan addendum): china runs the China
// set, taiwan runs the Taiwan set, either runs the China set plus the two
// Taiwan-only questions. Passport, the check status/age and the
// clean/disclose flag are asked on every route.
const DESTINATION_LABELS: Record<string, string> = {
  china: "Mainland China",
  taiwan: "Taiwan",
  either: "Open to either China or Taiwan",
};
// The Taiwan set — Barry's brief, 6 Sep 2026. Disqualifying answers are
// soft flags: labelled for Barry, never rejected.
const DEGREE_LABELS: Record<string, string> = {
  yes: "Completed on campus",
  no: "Online degree — not accepted for Taiwan",
};
const AGE_GROUP_LABELS: Record<string, string> = {
  any_3_16: "Any age from 3 to 16",
  "7_12_only": "Ages 7 to 12 only",
  older_only: "Prefers older students — outside the Taiwan age range",
};
const CHECK_RECENT_LABELS: Record<string, string> = {
  yes: "less than six months old",
  no: "more than six months old",
};
// The national check Taiwan asks for, by passport country (Barry's list;
// South Africa and Other fall back to generic wording).
const CHECK_NAMES: Record<string, string> = {
  uk: "Basic DBS check",
  ireland: "Garda Police Certificate",
  usa: "FBI background check",
  canada: "RCMP criminal record check",
  australia: "AFP National Police Check",
  new_zealand: "Ministry of Justice Criminal Record Check",
};

const MAX_LOCATIONS = 2000;
const MAX_CV_BYTES = 5 * 1024 * 1024;
// Multipart overhead margin over the 5 MB file cap, for the early
// Content-Length reject before the body is even read.
const MAX_BODY_BYTES = 6 * 1024 * 1024;
const CV_EXTENSIONS = /\.(pdf|doc|docx)$/;
// File.type is client-declared, so this is spam friction, not a security
// boundary — Barry's mail client is the real attachment-scanning layer.
// Some browsers/OSes report .doc as application/octet-stream.
const CV_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
]);

/** Outcome + timestamp only — never message content (PLAN §8.3). */
function log(outcome: string): void {
  console.log(JSON.stringify({ outcome, at: new Date().toISOString() }));
}

/** Every failure looks the same from outside; the page shows the mailto fallback. */
function fail(status: number): Response {
  return new Response(
    "Sorry — your message could not be sent. Please email us instead.",
    { status, headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}

/** 303 so a no-JS submit lands back on the posting page as a GET (PLAN §8.3). */
function succeed(origin: string, path: "/contact" | "/profile"): Response {
  return new Response(null, {
    status: 303,
    headers: { Location: `${origin}${path}?sent=1` },
  });
}

/** CR/LF would let a name or address smuggle extra mail headers. */
function stripCRLF(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

async function verifyTurnstile(
  token: string,
  secret: string,
  remoteip: string | null,
): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set("remoteip", remoteip);
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body },
  );
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

/**
 * The shared request prologue (§8.3 layers 1–3): origin check, body parse,
 * honeypot, time-trap. Returns a Response when the request is rejected (or
 * fake-accepted), otherwise the parsed form plus the caller's origin.
 */
async function gate(
  request: Request,
  env: Env,
  path: "/contact" | "/profile",
): Promise<Response | { origin: string; form: FormData }> {
  // Same-origin check: the browser sends Origin on form POSTs; fall back
  // to Referer's origin for anything odd. No match ⇒ not our form.
  const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  const origin =
    request.headers.get("Origin") ??
    (() => {
      const referer = request.headers.get("Referer");
      try {
        return referer ? new URL(referer).origin : null;
      } catch {
        return null;
      }
    })();
  if (!origin || !allowed.includes(origin)) {
    log("rejected-origin");
    return fail(403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    log("rejected-body");
    return fail(400);
  }

  // Honeypot: a human never sees the field; any value means a bot.
  // Pretend it worked so the bot learns nothing.
  if (field(form, FIELD_HONEYPOT) !== "") {
    log("dropped-honeypot");
    return succeed(origin, path);
  }

  // Time-trap: the form's JS stamps render time; a sub-3s fill is a bot,
  // and a missing stamp means the raw HTML was posted without JS (which
  // could never have passed Turnstile anyway). A visitor whose clock is
  // ahead of ours fails this too — they get the mailto fallback.
  const startedRaw = field(form, FIELD_STARTED);
  const started = Number(startedRaw); // Number("") is 0 — catch empty first
  if (
    startedRaw === "" ||
    !Number.isFinite(started) ||
    Date.now() - started < MIN_FILL_MS
  ) {
    log("rejected-timetrap");
    return fail(400);
  }

  return { origin, form };
}

/** Name/email rules shared by both flows; returns null when invalid. */
function validSender(
  form: FormData,
): { name: string; email: string } | null {
  const name = stripCRLF(field(form, FIELD_NAME));
  const email = stripCRLF(field(form, FIELD_EMAIL));
  if (
    name.length === 0 ||
    name.length > MAX_NAME ||
    email.length > MAX_EMAIL ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return null;
  }
  return { name, email };
}

async function sendViaResend(
  env: Env,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const send = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return send.ok;
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  const gated = await gate(request, env, "/contact");
  if (gated instanceof Response) return gated;
  const { origin, form } = gated;

  const sender = validSender(form);
  const message = field(form, FIELD_MESSAGE).trim();
  if (!sender || message.length === 0 || message.length > MAX_MESSAGE) {
    log("rejected-validation");
    return fail(400);
  }
  const { name, email } = sender;

  const human = await verifyTurnstile(
    field(form, FIELD_TURNSTILE),
    env.TURNSTILE_SECRET_KEY,
    request.headers.get("CF-Connecting-IP"),
  );
  if (!human) {
    log("rejected-turnstile");
    return fail(403);
  }

  // Relay via Resend. User content appears only as body text and as the
  // reply_to address (already CRLF-stripped and format-checked) — never
  // interpolated into other headers, never rendered as HTML (PLAN §8.3).
  const sent = await sendViaResend(env, {
    from: `Arun website <${env.FROM_EMAIL}>`,
    to: [env.TO_EMAIL],
    reply_to: email,
    subject: `Website enquiry from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });
  if (!sent) {
    log("failed-resend");
    return fail(502);
  }

  log("sent");
  return succeed(origin, "/contact");
}

/**
 * Strip anything that could smuggle headers or paths through an uploaded
 * filename: path components, CR/LF and control characters, then whitelist
 * the rest. Caps at 100 chars preserving the extension.
 */
function sanitiseFilename(raw: string): string {
  const last = raw.split(/[\\/]/).pop() ?? "";
  const cleaned = last
    .replace(/[\r\n\x00-\x1f\x7f]/g, "")
    .replace(/[^A-Za-z0-9._ -]/g, "_")
    .trim();
  const dot = cleaned.lastIndexOf(".");
  const ext = dot > 0 ? cleaned.slice(dot) : "";
  const stem = (dot > 0 ? cleaned.slice(0, dot) : cleaned).trim() || "cv";
  return `${stem.slice(0, Math.max(1, 100 - ext.length))}${ext}`;
}

/**
 * Workers have no Buffer; btoa takes a binary string. Chunk only the
 * String.fromCharCode spread (argument-count limits), then a single final
 * btoa — which avoids any base64 chunk-alignment bugs. A ~6.7 MB output
 * string is trivial against the Worker's 128 MB memory.
 */
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

async function handleProfile(request: Request, env: Env): Promise<Response> {
  // Early reject on declared size before reading the body. Content-Length
  // can be absent or wrong, so file.size is re-checked after parsing.
  const declared = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    log("rejected-size");
    return fail(413);
  }

  const gated = await gate(request, env, "/profile");
  if (gated instanceof Response) return gated;
  const { origin, form } = gated;

  const sender = validSender(form);
  const destination = field(form, "destination");
  if (!sender || !(destination in DESTINATION_LABELS)) {
    log("rejected-validation");
    return fail(400);
  }
  const { name, email } = sender;

  // Three validation blocks mirroring the wizard's routes (Taiwan
  // addendum): every route, the China set (china + either), the Taiwan set
  // (taiwan + either). Fields from the other set are ignored, not rejected.

  // Every route: passport, the check's status and age, the clean/disclose
  // flag. Expiry year is a format check only — an already-expired passport
  // is itself useful information for Barry, so it is not rejected. The
  // six-months answer is required exactly when the check is done.
  const passportCountry = field(form, "passport_country");
  const expiryMonth = field(form, "passport_expiry_month");
  const expiryYear = field(form, "passport_expiry_year");
  const background = field(form, "background_check");
  const docCheck = field(form, "doc_background_check");
  const checkRecent = field(form, "check_recent");
  const yearNum = Number(expiryYear);
  if (
    !(passportCountry in PASSPORT_LABELS) ||
    !/^(0[1-9]|1[0-2])$/.test(expiryMonth) ||
    !/^\d{4}$/.test(expiryYear) ||
    yearNum < 2020 ||
    yearNum > 2050 ||
    !(background in BACKGROUND_LABELS) ||
    !(docCheck in DOC_STATUS_LABELS) ||
    (docCheck === "done"
      ? !(checkRecent in CHECK_RECENT_LABELS)
      : checkRecent !== "")
  ) {
    log("rejected-validation");
    return fail(400);
  }

  const chinaLines: string[] = [];
  if (destination !== "taiwan") {
    const locations = field(form, "locations").trim();
    const anyLocation = field(form, "any_location");
    const jobTypes = [
      ...new Set(form.getAll("job_types").filter((v) => typeof v === "string")),
    ] as string[];
    const salary = stripCRLF(field(form, "salary_rmb"));
    const docDegree = field(form, "doc_degree_apostille");
    const docCert = field(form, "doc_teaching_certificate");
    if (
      locations.length > MAX_LOCATIONS ||
      (locations.length === 0 && anyLocation !== "yes") ||
      (anyLocation !== "" && anyLocation !== "yes") ||
      jobTypes.length === 0 ||
      jobTypes.some((t) => !(t in JOB_TYPE_LABELS)) ||
      !/^\d{1,7}$/.test(salary) ||
      Number(salary) < 1 ||
      !(docDegree in DOC_STATUS_LABELS) ||
      !(docCert in DOC_STATUS_LABELS)
    ) {
      log("rejected-validation");
      return fail(400);
    }
    const locationLine =
      anyLocation === "yes"
        ? locations.length > 0
          ? `Open to any location (preferences: ${locations})`
          : "Open to any location"
        : locations;
    chinaLines.push(
      `Preferred locations: ${locationLine}`,
      `Preferred job types: ${jobTypes.map((t) => JOB_TYPE_LABELS[t]).join(", ")}`,
      `Salary expectation: ${salary} RMB per month`,
      `Degree apostille: ${DOC_STATUS_LABELS[docDegree]}`,
      `Teaching certificate: ${DOC_STATUS_LABELS[docCert]}`,
    );
  }

  const taiwanLines: string[] = [];
  if (destination !== "china") {
    const degree = field(form, "degree_on_campus");
    const ages = field(form, "age_groups");
    if (!(degree in DEGREE_LABELS) || !(ages in AGE_GROUP_LABELS)) {
      log("rejected-validation");
      return fail(400);
    }
    taiwanLines.push(
      `Degree completed on campus: ${DEGREE_LABELS[degree]}`,
      `Age groups: ${AGE_GROUP_LABELS[ages]}`,
    );
  }

  const checkName = CHECK_NAMES[passportCountry] ?? "national criminal record check";
  const checkLine =
    docCheck === "done"
      ? `Done, ${CHECK_RECENT_LABELS[checkRecent]}`
      : DOC_STATUS_LABELS[docCheck];
  const commonLines = [
    `Background check (${checkName}): ${checkLine}`,
    `Passport: ${PASSPORT_LABELS[passportCountry]}, expires ${expiryMonth}/${expiryYear}`,
    `Background check flag: ${BACKGROUND_LABELS[background]}`,
  ];

  const cv = form.get("cv");
  if (
    !(cv instanceof File) ||
    cv.size === 0 ||
    cv.size > MAX_CV_BYTES ||
    (cv.type !== "" && !CV_MIME_TYPES.has(cv.type))
  ) {
    log("rejected-cv");
    return fail(400);
  }
  const filename = sanitiseFilename(cv.name);
  if (!CV_EXTENSIONS.test(filename.toLowerCase())) {
    log("rejected-cv");
    return fail(400);
  }

  const human = await verifyTurnstile(
    field(form, FIELD_TURNSTILE),
    env.TURNSTILE_SECRET_KEY,
    request.headers.get("CF-Connecting-IP"),
  );
  if (!human) {
    log("rejected-turnstile");
    return fail(403);
  }

  // Same relay rules as the contact flow: user content in body text and
  // reply_to only, plain text, never HTML; the CV rides as an attachment
  // and is never stored anywhere (PLAN amendment 2 Sep 2026 (profile)).
  const body = [
    `From: ${name} <${email}>`,
    "",
    `Interested in: ${DESTINATION_LABELS[destination]}`,
    ...chinaLines,
    ...taiwanLines,
    ...commonLines,
    "",
    `CV attached: ${filename}`,
  ].join("\n");

  const sent = await sendViaResend(env, {
    from: `Arun website <${env.FROM_EMAIL}>`,
    to: [env.TO_EMAIL],
    reply_to: email,
    subject: `Teacher profile from ${name}`,
    text: body,
    attachments: [
      { filename, content: toBase64(new Uint8Array(await cv.arrayBuffer())) },
    ],
  });
  if (!sent) {
    log("failed-resend");
    return fail(502);
  }

  log("sent");
  return succeed(origin, "/profile");
}

const handler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "POST" },
      });
    }

    const { pathname } = new URL(request.url);
    if (pathname === "/api/contact") return handleContact(request, env);
    if (pathname === "/api/profile") return handleProfile(request, env);
    log("rejected-path");
    return fail(404);
  },
};

export default handler;
