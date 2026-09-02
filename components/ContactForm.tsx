"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { APPLY_EMAIL } from "@/lib/site";

/**
 * The general enquiry form (PLAN §7; the Teacher Profile wizard at
 * /profile is the site's one other form — PLAN amendment 2 Sep 2026
 * (profile)). Name, email, message; posts to the Worker at /api/contact
 * (worker/index.ts, PLAN §8.3). Nothing is stored anywhere: the Worker
 * relays the message to Barry's inbox and forgets it (CLAUDE.md
 * guardrail 4).
 *
 * Progressive enhancement mirrors JobsIndex: the form is hidden until
 * hydration (Turnstile needs JS, so without JS it could never submit), and
 * the page shows the mailto path in <noscript> plus the always-visible
 * contact details alongside. JS submits via fetch for an inline success
 * state; the Worker's no-JS answer is a 303 to /contact?sent=1, which this
 * component also recognises on load.
 */

// Cloudflare's published Turnstile TEST site key — always passes, pairs with
// the test secret in worker/README.md. The real key arrives at deploy time
// (PLAN §13 step 8) via NEXT_PUBLIC_TURNSTILE_SITE_KEY (public by design).
const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

const CONTACT_ENDPOINT = "/api/contact";

// Shared with ProfileWizard (global declarations merge project-wide).
// render() is Turnstile's explicit-mode API — the wizard needs it because
// its widget container only mounts on the final step, after the script's
// implicit scan has already run.
declare global {
  interface Window {
    turnstile?: {
      reset: () => void;
      render: (el: HTMLElement, opts: { sitekey: string }) => string;
    };
  }
}

// Same server-snapshot pattern as JobsIndex: false during prerender, true on
// the client, without a set-state-in-effect.
const noopSubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
const useSearch = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => window.location.search,
    () => "",
  );

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const mounted = useMounted();
  // A no-JS submit round-trips through the Worker's 303 to /contact?sent=1.
  const sentViaRedirect = new URLSearchParams(useSearch()).get("sent") === "1";
  const [status, setStatus] = useState<Status>("idle");
  // Time-trap stamp (PLAN §8.3), set through a ref after hydration so the
  // static HTML carries no build-time value and nothing mismatches.
  const startedRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");
    try {
      // redirect: "manual" — the Worker answers 303 on success; there is no
      // need to follow it and refetch this page.
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        redirect: "manual",
      });
      if (res.type === "opaqueredirect" || res.ok) {
        form.reset();
        setStatus("sent");
      } else {
        setStatus("error");
        window.turnstile?.reset(); // tokens are single-use
      }
    } catch {
      setStatus("error");
      window.turnstile?.reset();
    }
  }

  if (status === "sent" || sentViaRedirect) {
    return (
      <div
        role="status"
        className="rounded-card border border-harbour bg-foam p-8"
      >
        <h2 className="text-h3">Message sent</h2>
        <p className="mt-3 text-flint">
          Thank you — we will reply to the email address you gave. If you
          don&rsquo;t hear back within a few days, write to us directly at{" "}
          <span className="select-all text-ink">{APPLY_EMAIL}</span>.
        </p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <form
        method="post"
        action={CONTACT_ENDPOINT}
        onSubmit={submit}
        hidden={!mounted}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="contact-name"
            className="block text-fine font-medium text-channel"
          >
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            maxLength={200}
            autoComplete="name"
            className="mt-1.5 w-full rounded-btn border-[1.5px] border-gull bg-white px-3.5 py-2.5 text-ink"
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="block text-fine font-medium text-channel"
          >
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className="mt-1.5 w-full rounded-btn border-[1.5px] border-gull bg-white px-3.5 py-2.5 text-ink"
          />
        </div>
        <div>
          <label
            htmlFor="contact-message"
            className="block text-fine font-medium text-channel"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            maxLength={5000}
            rows={7}
            className="mt-1.5 w-full rounded-btn border-[1.5px] border-gull bg-white px-3.5 py-2.5 text-ink"
          />
        </div>

        {/* Honeypot (PLAN §8.3): invisible to people, tempting to bots.
            Any value makes the Worker silently drop the submission. */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        {/* Time-trap stamp — filled after hydration, see above. */}
        <input
          ref={startedRef}
          type="hidden"
          name="form_started_at"
          defaultValue=""
        />
        {/* Turnstile (PLAN §14.2) — the script injects the widget here and
            adds a hidden cf-turnstile-response input to the form. */}
        <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} />

        {status === "error" && (
          <p role="alert" className="text-fine text-rust">
            Sorry — your message could not be sent. Please email us instead at{" "}
            <a
              href={`mailto:${APPLY_EMAIL}`}
              className="select-all font-medium underline underline-offset-4"
            >
              {APPLY_EMAIL}
            </a>
            .
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center justify-center rounded-btn bg-harbour px-5 py-2.5 font-medium text-chalk transition-colors duration-150 ease-out hover:bg-harbour-deep disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>

        {/* Disclosure line — wording per PLAN §7 */}
        <p className="text-[0.8125rem] text-flint">
          This form collects your name and email address so we can reply to
          you. See our{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 transition-colors duration-150 hover:text-harbour-deep"
          >
            privacy policy
          </Link>
          .
        </p>
      </form>
    </>
  );
}
