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

process.stdout.write(results.join("\n") + "\n");
