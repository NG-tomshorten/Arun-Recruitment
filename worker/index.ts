/**
 * Cloudflare Worker — the contact relay at POST /api/contact (PLAN §8.3).
 *
 * This is the one piece of the system that is not a static file (CLAUDE.md
 * guardrail 7 exception). It relays the /contact enquiry form to Barry's
 * inbox via Resend and stores nothing: no KV, no queue, no message content
 * in logs. Deployed separately from the site build — see worker/README.md.
 *
 * Hardening layers, in request order (PLAN §8.3):
 *   1. POST only; same-origin Origin/Referer check
 *   2. honeypot field — any value ⇒ silently accept and drop
 *   3. time-trap — submissions under ~3s after render rejected
 *   4. validation + CRLF stripping (mail-header injection)
 *   5. Turnstile server-side verification
 *   6. Resend send: user content in body text only, never in headers
 *      beyond reply_to; from the verified send. subdomain (PLAN §8.4)
 * The Cloudflare zone rate-limit rule (5 req/min/IP on this route) is
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

// Field names — must match components/ContactForm.tsx.
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

/** 303 so a no-JS submit lands back on the page as a GET (PLAN §8.3). */
function succeed(origin: string): Response {
  return new Response(null, {
    status: 303,
    headers: { Location: `${origin}/contact?sent=1` },
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

const handler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "POST" },
      });
    }

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
      return succeed(origin);
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

    const name = stripCRLF(field(form, FIELD_NAME));
    const email = stripCRLF(field(form, FIELD_EMAIL));
    const message = field(form, FIELD_MESSAGE).trim();
    if (
      name.length === 0 ||
      name.length > MAX_NAME ||
      email.length > MAX_EMAIL ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      message.length === 0 ||
      message.length > MAX_MESSAGE
    ) {
      log("rejected-validation");
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

    // Relay via Resend. User content appears only as body text and as the
    // reply_to address (already CRLF-stripped and format-checked) — never
    // interpolated into other headers, never rendered as HTML (PLAN §8.3).
    const send = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Arun website <${env.FROM_EMAIL}>`,
        to: [env.TO_EMAIL],
        reply_to: email,
        subject: `Website enquiry from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
    });
    if (!send.ok) {
      log("failed-resend");
      return fail(502);
    }

    log("sent");
    return succeed(origin);
  },
};

export default handler;
