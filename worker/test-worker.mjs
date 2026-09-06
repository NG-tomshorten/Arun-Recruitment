/**
 * Unit harness for worker/index.ts — no dependencies (CLAUDE.md guardrail 2).
 * Runs the Worker's fetch handler in Node (≥23.6 strips TS types natively)
 * with Turnstile and Resend stubbed, and asserts every §8.3 branch.
 *
 *   node worker/test-worker.mjs
 */
import assert from "node:assert/strict";
import worker from "./index.ts";

const ORIGIN = "https://www.arunlanguagetraining.com";
const env = {
  TURNSTILE_SECRET_KEY: "test-secret",
  RESEND_API_KEY: "test-key",
  ALLOWED_ORIGINS: `${ORIGIN},https://arunlanguagetraining.com`,
  TO_EMAIL: "info@arunlanguagetraining.com",
  FROM_EMAIL: "enquiries@send.arunlanguagetraining.com",
};

// ---- stubs -----------------------------------------------------------------
let turnstileVerdict = true;
let resendStatus = 200;
let resendPayload = null; // captured body of the last Resend call
let resendCalls = 0;

globalThis.fetch = async (url, init) => {
  if (String(url).includes("challenges.cloudflare.com")) {
    return Response.json({ success: turnstileVerdict });
  }
  if (String(url).includes("api.resend.com")) {
    resendCalls += 1;
    resendPayload = JSON.parse(init.body);
    return new Response(resendStatus === 200 ? "{}" : "nope", {
      status: resendStatus,
    });
  }
  throw new Error(`unexpected fetch: ${url}`);
};
console.log = () => {}; // silence the Worker's outcome logs

// ---- helpers ---------------------------------------------------------------
function goodFields(overrides = {}) {
  return {
    name: "Test Person",
    email: "test@example.com",
    message: "Hello, I have a question about a role.",
    website: "",
    form_started_at: String(Date.now() - 10_000),
    "cf-turnstile-response": "tok",
    ...overrides,
  };
}

function post(fields, headers = { Origin: ORIGIN }) {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) if (v !== null) form.set(k, v);
  return worker.fetch(
    new Request(`${ORIGIN}/api/contact`, { method: "POST", body: form, headers }),
    env,
  );
}

const results = [];
async function test(label, fn) {
  turnstileVerdict = true;
  resendStatus = 200;
  resendPayload = null;
  resendCalls = 0;
  try {
    await fn();
    results.push(`✓ ${label}`);
  } catch (err) {
    results.push(`✗ ${label}: ${err.message}`);
    process.exitCode = 1;
  }
}

// ---- the §8.3 branches -----------------------------------------------------
await test("GET is refused with 405", async () => {
  const res = await worker.fetch(
    new Request(`${ORIGIN}/api/contact`, { method: "GET" }),
    env,
  );
  assert.equal(res.status, 405);
  assert.equal(res.headers.get("Allow"), "POST");
});

await test("missing Origin/Referer → 403", async () => {
  assert.equal((await post(goodFields(), {})).status, 403);
});

await test("foreign Origin → 403", async () => {
  const res = await post(goodFields(), { Origin: "https://evil.example" });
  assert.equal(res.status, 403);
});

await test("Referer origin accepted when Origin absent", async () => {
  const res = await post(goodFields(), { Referer: `${ORIGIN}/contact` });
  assert.equal(res.status, 303);
});

await test("filled honeypot → fake success, nothing sent", async () => {
  const res = await post(goodFields({ website: "https://spam.example" }));
  assert.equal(res.status, 303);
  assert.equal(resendCalls, 0);
});

await test("missing time-trap stamp → 400", async () => {
  assert.equal((await post(goodFields({ form_started_at: null }))).status, 400);
});

await test("sub-3s fill → 400", async () => {
  const res = await post(
    goodFields({ form_started_at: String(Date.now() - 1000) }),
  );
  assert.equal(res.status, 400);
});

await test("empty name → 400", async () => {
  assert.equal((await post(goodFields({ name: "  " }))).status, 400);
});

await test("invalid email → 400", async () => {
  assert.equal((await post(goodFields({ email: "not-an-email" }))).status, 400);
});

await test("oversize message → 400", async () => {
  assert.equal((await post(goodFields({ message: "x".repeat(5001) }))).status, 400);
});

await test("CRLF stripped from name and email (header injection)", async () => {
  const res = await post(
    goodFields({ name: "Eve\r\nBcc: victim@example.com" }),
  );
  assert.equal(res.status, 303);
  assert.ok(!resendPayload.subject.includes("\n"));
  assert.ok(!resendPayload.subject.includes("\r"));
  assert.equal(resendPayload.subject, "Website enquiry from Eve Bcc: victim@example.com");
});

await test("Turnstile failure → 403, nothing sent", async () => {
  turnstileVerdict = false;
  const res = await post(goodFields());
  assert.equal(res.status, 403);
  assert.equal(resendCalls, 0);
});

await test("Resend failure → 502", async () => {
  resendStatus = 401;
  assert.equal((await post(goodFields())).status, 502);
});

await test("happy path → 303 to /contact?sent=1 with correct envelope", async () => {
  const res = await post(goodFields());
  assert.equal(res.status, 303);
  assert.equal(res.headers.get("Location"), `${ORIGIN}/contact?sent=1`);
  assert.equal(resendPayload.from, `Arun website <${env.FROM_EMAIL}>`);
  assert.deepEqual(resendPayload.to, [env.TO_EMAIL]);
  assert.equal(resendPayload.reply_to, "test@example.com");
  assert.equal(resendPayload.subject, "Website enquiry from Test Person");
  assert.ok(resendPayload.text.includes("Hello, I have a question"));
  assert.ok(!("html" in resendPayload)); // user content is never rendered as HTML
});

// ---- the profile route (PLAN amendment 2 Sep 2026 (profile)) ---------------
// Node ≥20 provides File/FormData/Blob as undici globals, so the CV rides
// through the same helpers.

function cvFile(
  bytes = new Uint8Array(1024),
  name = "cv.pdf",
  type = "application/pdf",
) {
  return new File([bytes], name, { type });
}

function goodProfileFields(overrides = {}) {
  return {
    destination: "china",
    locations: "Chengdu or Kunming",
    any_location: "",
    job_types: ["training_centre", "university"],
    salary_rmb: "25000",
    doc_degree_apostille: "in_progress",
    doc_teaching_certificate: "done",
    doc_background_check: "not_started",
    passport_country: "uk",
    passport_expiry_month: "06",
    passport_expiry_year: "2029",
    background_check: "clean",
    check_recent: "",
    name: "Test Person",
    email: "test@example.com",
    cv: cvFile(),
    website: "",
    form_started_at: String(Date.now() - 10_000),
    "cf-turnstile-response": "tok",
    ...overrides,
  };
}

// The Taiwan set (Taiwan addendum): no China fields at all.
function goodTaiwanFields(overrides = {}) {
  return {
    destination: "taiwan",
    degree_on_campus: "yes",
    age_groups: "any_3_16",
    doc_background_check: "done",
    check_recent: "yes",
    passport_country: "uk",
    passport_expiry_month: "06",
    passport_expiry_year: "2029",
    background_check: "clean",
    name: "Test Person",
    email: "test@example.com",
    cv: cvFile(),
    website: "",
    form_started_at: String(Date.now() - 10_000),
    "cf-turnstile-response": "tok",
    ...overrides,
  };
}

// "Either" needs both sets.
function goodEitherFields(overrides = {}) {
  return goodProfileFields({
    destination: "either",
    degree_on_campus: "yes",
    age_groups: "7_12_only",
    ...overrides,
  });
}

function postProfile(fields, headers = { Origin: ORIGIN }) {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v === null) continue;
    if (Array.isArray(v)) for (const item of v) form.append(k, item);
    else form.set(k, v);
  }
  return worker.fetch(
    new Request(`${ORIGIN}/api/profile`, { method: "POST", body: form, headers }),
    env,
  );
}

await test("unknown path → 404", async () => {
  const form = new FormData();
  const res = await worker.fetch(
    new Request(`${ORIGIN}/api/nope`, {
      method: "POST",
      body: form,
      headers: { Origin: ORIGIN },
    }),
    env,
  );
  assert.equal(res.status, 404);
});

await test("profile: GET is refused with 405", async () => {
  const res = await worker.fetch(
    new Request(`${ORIGIN}/api/profile`, { method: "GET" }),
    env,
  );
  assert.equal(res.status, 405);
});

await test("profile: foreign Origin → 403", async () => {
  const res = await postProfile(goodProfileFields(), {
    Origin: "https://evil.example",
  });
  assert.equal(res.status, 403);
});

await test("profile: filled honeypot → fake success to /profile, nothing sent", async () => {
  const res = await postProfile(
    goodProfileFields({ website: "https://spam.example" }),
  );
  assert.equal(res.status, 303);
  assert.equal(res.headers.get("Location"), `${ORIGIN}/profile?sent=1`);
  assert.equal(resendCalls, 0);
});

await test("profile: sub-3s fill → 400", async () => {
  const res = await postProfile(
    goodProfileFields({ form_started_at: String(Date.now() - 1000) }),
  );
  assert.equal(res.status, 400);
});

await test("profile: every enum field rejects an out-of-enum value", async () => {
  const enumFields = [
    "destination",
    "doc_degree_apostille",
    "doc_teaching_certificate",
    "doc_background_check",
    "passport_country",
    "background_check",
    "any_location",
  ];
  for (const f of enumFields) {
    const res = await postProfile(goodProfileFields({ [f]: "not-a-value" }));
    assert.equal(res.status, 400, `${f} accepted a bad value`);
  }
});

await test("profile: job types need at least one valid value", async () => {
  assert.equal(
    (await postProfile(goodProfileFields({ job_types: [] }))).status,
    400,
  );
  const res = await postProfile(
    goodProfileFields({ job_types: ["training_centre", "not-a-value"] }),
  );
  assert.equal(res.status, 400);
});

await test("profile: locations required unless open to any", async () => {
  assert.equal((await postProfile(goodProfileFields({ locations: "  " }))).status, 400);
  const res = await postProfile(
    goodProfileFields({ locations: "", any_location: "yes" }),
  );
  assert.equal(res.status, 303);
});

await test("profile: oversize locations → 400", async () => {
  const res = await postProfile(
    goodProfileFields({ locations: "x".repeat(2001) }),
  );
  assert.equal(res.status, 400);
});

await test("profile: salary must be a positive integer", async () => {
  for (const bad of ["0", "-5", "12.5", "abc", "12345678", ""]) {
    const res = await postProfile(goodProfileFields({ salary_rmb: bad }));
    assert.equal(res.status, 400, `salary "${bad}" accepted`);
  }
  assert.equal((await postProfile(goodProfileFields({ salary_rmb: "1" }))).status, 303);
});

await test("profile: passport expiry format enforced", async () => {
  for (const [k, v] of [
    ["passport_expiry_month", "13"],
    ["passport_expiry_month", "0"],
    ["passport_expiry_year", "1999"],
    ["passport_expiry_year", "2051"],
    ["passport_expiry_year", "soon"],
  ]) {
    const res = await postProfile(goodProfileFields({ [k]: v }));
    assert.equal(res.status, 400, `${k}=${v} accepted`);
  }
  // Already expired is deliberately fine — useful information for Barry.
  const res = await postProfile(
    goodProfileFields({ passport_expiry_year: "2021" }),
  );
  assert.equal(res.status, 303);
});

await test("profile: bad email / empty or oversize name → 400", async () => {
  assert.equal((await postProfile(goodProfileFields({ email: "nope" }))).status, 400);
  assert.equal((await postProfile(goodProfileFields({ name: "  " }))).status, 400);
  assert.equal(
    (await postProfile(goodProfileFields({ name: "x".repeat(201) }))).status,
    400,
  );
});

await test("profile: missing, empty or oversize CV → 400", async () => {
  assert.equal((await postProfile(goodProfileFields({ cv: null }))).status, 400);
  assert.equal(
    (await postProfile(goodProfileFields({ cv: cvFile(new Uint8Array(0)) }))).status,
    400,
  );
  const big = cvFile(new Uint8Array(5 * 1024 * 1024 + 1));
  assert.equal((await postProfile(goodProfileFields({ cv: big }))).status, 400);
});

await test("profile: disallowed CV extension or MIME → 400", async () => {
  for (const name of ["cv.exe", "cv.pdf.exe", "cv", "cv."]) {
    const res = await postProfile(
      goodProfileFields({ cv: cvFile(undefined, name) }),
    );
    assert.equal(res.status, 400, `${name} accepted`);
  }
  const badMime = cvFile(undefined, "cv.pdf", "text/html");
  assert.equal((await postProfile(goodProfileFields({ cv: badMime }))).status, 400);
  // Empty and octet-stream declared types are tolerated (some browsers/OSes).
  for (const type of ["", "application/octet-stream"]) {
    const res = await postProfile(
      goodProfileFields({ cv: cvFile(undefined, "cv.doc", type) }),
    );
    assert.equal(res.status, 303, `type "${type}" rejected`);
  }
});

await test("profile: attachment filename is sanitised", async () => {
  const evil = cvFile(undefined, "..\\..\\evil\r\nname.pdf");
  const res = await postProfile(goodProfileFields({ cv: evil }));
  assert.equal(res.status, 303);
  const { filename } = resendPayload.attachments[0];
  assert.ok(!/[\r\n\\/]/.test(filename), `unsafe filename: ${filename}`);
  assert.ok(filename.endsWith(".pdf"));
});

await test("profile: Turnstile failure → 403, nothing sent", async () => {
  turnstileVerdict = false;
  const res = await postProfile(goodProfileFields());
  assert.equal(res.status, 403);
  assert.equal(resendCalls, 0);
});

await test("profile: Resend failure → 502", async () => {
  resendStatus = 401;
  assert.equal((await postProfile(goodProfileFields())).status, 502);
});

await test("profile: happy path → 303 with full envelope and attachment", async () => {
  const bytes = new Uint8Array(512).map((_, i) => i % 256);
  const res = await postProfile(goodProfileFields({ cv: cvFile(bytes) }));
  assert.equal(res.status, 303);
  assert.equal(res.headers.get("Location"), `${ORIGIN}/profile?sent=1`);
  assert.equal(resendPayload.from, `Arun website <${env.FROM_EMAIL}>`);
  assert.deepEqual(resendPayload.to, [env.TO_EMAIL]);
  assert.equal(resendPayload.reply_to, "test@example.com");
  assert.equal(resendPayload.subject, "Teacher profile from Test Person");
  for (const line of [
    "Interested in: Mainland China",
    "Preferred locations: Chengdu or Kunming",
    "Preferred job types: Training centre, University",
    "Salary expectation: 25000 RMB per month",
    "Degree apostille: In progress",
    "Teaching certificate: Done",
    "Background check (Basic DBS check): Not started",
    "Passport: United Kingdom, expires 06/2029",
    "Background check flag: Clean",
  ]) {
    assert.ok(resendPayload.text.includes(line), `missing line: ${line}`);
  }
  assert.ok(!("html" in resendPayload)); // user content is never rendered as HTML
  assert.equal(resendPayload.attachments.length, 1);
  assert.equal(resendPayload.attachments[0].filename, "cv.pdf");
  // Base64 round-trip — catches String.fromCharCode misuse on high bytes.
  const decoded = Buffer.from(resendPayload.attachments[0].content, "base64");
  assert.deepEqual(new Uint8Array(decoded), bytes);
});

await test("profile: open-to-any with preferences noted in body", async () => {
  const res = await postProfile(
    goodProfileFields({ any_location: "yes", locations: "ideally Yunnan" }),
  );
  assert.equal(res.status, 303);
  assert.ok(
    resendPayload.text.includes(
      "Preferred locations: Open to any location (preferences: ideally Yunnan)",
    ),
  );
});

// ---- the Taiwan set (Taiwan addendum) --------------------------------------

await test("profile: taiwan happy path carries the Taiwan set, not the China set", async () => {
  const res = await postProfile(goodTaiwanFields());
  assert.equal(res.status, 303);
  assert.equal(res.headers.get("Location"), `${ORIGIN}/profile?sent=1`);
  const { text } = resendPayload;
  assert.ok(text.includes("Interested in: Taiwan"));
  assert.ok(text.includes("Degree completed on campus: Completed on campus"));
  assert.ok(text.includes("Age groups: Any age from 3 to 16"));
  assert.ok(
    text.includes("Background check (Basic DBS check): Done, less than six months old"),
  );
  assert.ok(text.includes("Passport: United Kingdom, expires 06/2029"));
  assert.ok(text.includes("Background check flag: Clean"));
  assert.ok(!text.includes("Preferred locations"));
  assert.ok(!text.includes("Salary expectation"));
  assert.ok(!text.includes("Degree apostille"));
  assert.ok(!text.includes("not built yet"));
  assert.equal(resendPayload.attachments.length, 1);
});

await test("profile: taiwan requires its own fields", async () => {
  for (const f of ["degree_on_campus", "age_groups"]) {
    assert.equal(
      (await postProfile(goodTaiwanFields({ [f]: null }))).status,
      400,
      `${f} missing was accepted`,
    );
    assert.equal(
      (await postProfile(goodTaiwanFields({ [f]: "not-a-value" }))).status,
      400,
      `${f} accepted a bad value`,
    );
  }
});

await test("profile: taiwan still requires passport, check status and flag", async () => {
  for (const f of [
    "passport_country",
    "passport_expiry_month",
    "passport_expiry_year",
    "background_check",
    "doc_background_check",
  ]) {
    assert.equal(
      (await postProfile(goodTaiwanFields({ [f]: null }))).status,
      400,
      `${f} missing was accepted`,
    );
  }
});

await test("profile: taiwan ignores stray China fields", async () => {
  const res = await postProfile(
    goodTaiwanFields({ salary_rmb: "abc", locations: "" }),
  );
  assert.equal(res.status, 303);
  assert.ok(!resendPayload.text.includes("Salary expectation"));
});

await test("profile: six-months answer required exactly when the check is done", async () => {
  const cases = [
    ["done", "", 400],
    ["done", "maybe", 400],
    ["done", "no", 303],
    ["not_started", "yes", 400],
    ["in_progress", "", 303],
  ];
  for (const [status, recent, expected] of cases) {
    const res = await postProfile(
      goodTaiwanFields({ doc_background_check: status, check_recent: recent }),
    );
    assert.equal(res.status, expected, `${status}+"${recent}" → ${res.status}`);
  }
  // The same rule holds on the China route (the documents step asks it).
  assert.equal(
    (await postProfile(goodProfileFields({ doc_background_check: "done" }))).status,
    400,
  );
  const res = await postProfile(
    goodProfileFields({ doc_background_check: "done", check_recent: "no" }),
  );
  assert.equal(res.status, 303);
  assert.ok(
    resendPayload.text.includes(
      "Background check (Basic DBS check): Done, more than six months old",
    ),
  );
});

await test("profile: the check is named from the passport country", async () => {
  const expected = {
    uk: "Basic DBS check",
    ireland: "Garda Police Certificate",
    usa: "FBI background check",
    canada: "RCMP criminal record check",
    australia: "AFP National Police Check",
    new_zealand: "Ministry of Justice Criminal Record Check",
    south_africa: "national criminal record check",
    other: "national criminal record check",
  };
  for (const [country, name] of Object.entries(expected)) {
    const res = await postProfile(goodTaiwanFields({ passport_country: country }));
    assert.equal(res.status, 303);
    assert.ok(
      resendPayload.text.includes(`Background check (${name}):`),
      `${country} → ${name}`,
    );
  }
});

await test("profile: disqualifying Taiwan answers are soft flags, not rejections", async () => {
  let res = await postProfile(goodTaiwanFields({ degree_on_campus: "no" }));
  assert.equal(res.status, 303);
  assert.ok(
    resendPayload.text.includes(
      "Degree completed on campus: Online degree — not accepted for Taiwan",
    ),
  );
  res = await postProfile(goodTaiwanFields({ age_groups: "older_only" }));
  assert.equal(res.status, 303);
  assert.ok(
    resendPayload.text.includes(
      "Age groups: Prefers older students — outside the Taiwan age range",
    ),
  );
});

await test("profile: 'either' needs both sets and reports both", async () => {
  assert.equal(
    (await postProfile(goodEitherFields({ salary_rmb: null }))).status,
    400,
  );
  assert.equal(
    (await postProfile(goodEitherFields({ degree_on_campus: null }))).status,
    400,
  );
  const res = await postProfile(goodEitherFields());
  assert.equal(res.status, 303);
  const { text } = resendPayload;
  assert.ok(text.includes("Interested in: Open to either China or Taiwan"));
  assert.ok(text.includes("Salary expectation: 25000 RMB per month"));
  assert.ok(text.includes("Degree completed on campus: Completed on campus"));
  assert.ok(text.includes("Age groups: Ages 7 to 12 only"));
  // China lines precede Taiwan lines, which precede the shared lines.
  assert.ok(
    text.indexOf("Salary expectation") <
      text.indexOf("Degree completed on campus") &&
      text.indexOf("Degree completed on campus") <
        text.indexOf("Background check ("),
  );
});

await test("profile: china ignores stray Taiwan fields", async () => {
  const res = await postProfile(goodProfileFields({ degree_on_campus: "garbage" }));
  assert.equal(res.status, 303);
  assert.ok(!resendPayload.text.includes("Degree completed on campus"));
});

await test("profile: missing destination → 400", async () => {
  assert.equal(
    (await postProfile(goodProfileFields({ destination: null }))).status,
    400,
  );
});

await test("profile: disclose flag carries the discuss-privately line", async () => {
  const res = await postProfile(
    goodProfileFields({ background_check: "disclose" }),
  );
  assert.equal(res.status, 303);
  assert.ok(
    resendPayload.text.includes(
      "Background check flag: Has something to disclose — discuss privately",
    ),
  );
});

process.stdout.write(results.join("\n") + "\n");
