"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { APPLY_EMAIL } from "@/lib/site";

/**
 * The Teacher Profile wizard (PLAN amendment 2 Sep 2026 (profile)): a
 * start screen, a China/Taiwan destination question that FORKS the route,
 * the question steps, a contact-details step with CV upload, and a
 * completion screen — one static route, screens switched in React state.
 *
 * Routes: China (and "open to either") get the full six-question set.
 * The Taiwan question set is still being written by Barry, so its route is
 * a skeleton — a placeholder step, then straight to contact details + CV,
 * so a Taiwan candidate still reaches Barry's inbox today.
 *
 * Posts to the Worker at /api/profile (worker/index.ts), which relays the
 * answers to Barry's inbox with the CV as an email attachment. Nothing is
 * stored anywhere: not on this site, not in localStorage — a refresh loses
 * progress by design, and the Worker forgets the CV once Resend accepts it.
 *
 * Progressive enhancement mirrors ContactForm: the wizard is hidden until
 * hydration (Turnstile needs JS, so without JS it could never submit) and
 * the page shows the mailto path in <noscript>. The Worker's no-JS answer
 * is a 303 to /profile?sent=1, which this component also recognises.
 *
 * The whole wizard is one <form> so the final submit's FormData picks up
 * the honeypot, time-trap and Turnstile inputs; earlier steps' answers are
 * unmounted by then and are written into the payload from state instead.
 * Validation is custom per step (noValidate) so every error uses the same
 * styled, announced pattern rather than native bubbles on some steps only.
 */

// Cloudflare's published Turnstile TEST site key — always passes, pairs
// with the test secret in worker/README.md. The real key arrives at deploy
// time via NEXT_PUBLIC_TURNSTILE_SITE_KEY (public by design).
const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

const PROFILE_ENDPOINT = "/api/profile";
const MAX_CV_BYTES = 5 * 1024 * 1024;

// Option values must match the Worker's label maps (worker/index.ts).
const DESTINATIONS = [
  ["china", "Mainland China"],
  ["taiwan", "Taiwan"],
  ["either", "Open to either"],
] as const;

const JOB_TYPES = [
  ["kindergarten", "Kindergarten"],
  ["training_centre", "Training centre"],
  ["primary_school", "Primary school"],
  ["middle_school", "Middle school"],
  ["high_school", "High school"],
  ["university", "University"],
] as const;

const DOC_STATUSES = [
  ["not_started", "Not started"],
  ["in_progress", "In progress"],
  ["done", "Done"],
] as const;

const PASSPORT_COUNTRIES = [
  ["uk", "United Kingdom"],
  ["ireland", "Ireland"],
  ["usa", "United States"],
  ["canada", "Canada"],
  ["australia", "Australia"],
  ["new_zealand", "New Zealand"],
  ["south_africa", "South Africa"],
  ["other", "Other"],
] as const;

const MONTHS = [
  ["01", "January"],
  ["02", "February"],
  ["03", "March"],
  ["04", "April"],
  ["05", "May"],
  ["06", "June"],
  ["07", "July"],
  ["08", "August"],
  ["09", "September"],
  ["10", "October"],
  ["11", "November"],
  ["12", "December"],
] as const;

// A static range so the prerendered HTML never drifts from the client
// (the Worker accepts 2020–2050). Refresh alongside lib/rates.ts.
const EXPIRY_YEARS: readonly (readonly [string, string])[] = Array.from(
  { length: 15 },
  (_, i) => [String(2026 + i), String(2026 + i)] as const,
);

type DocStatus = "" | "not_started" | "in_progress" | "done";
type Destination = "" | "china" | "taiwan" | "either";

type Answers = {
  destination: Destination;
  locations: string;
  anyLocation: boolean;
  jobTypes: string[];
  salaryRmb: string;
  docDegree: DocStatus;
  docTeachingCert: DocStatus;
  docBackgroundCheck: DocStatus;
  passportCountry: string;
  passportExpiryMonth: string;
  passportExpiryYear: string;
  backgroundCheck: "" | "clean" | "disclose";
  name: string;
  email: string;
  cvFile: File | null;
};

const EMPTY_ANSWERS: Answers = {
  destination: "",
  locations: "",
  anyLocation: false,
  jobTypes: [],
  salaryRmb: "",
  docDegree: "",
  docTeachingCert: "",
  docBackgroundCheck: "",
  passportCountry: "",
  passportExpiryMonth: "",
  passportExpiryYear: "",
  backgroundCheck: "",
  name: "",
  email: "",
  cvFile: null,
};

/**
 * The wizard is a walk along a route of step ids, and the destination
 * answer picks the route. Both routes share the [start, destination]
 * prefix, so switching destination on the second screen is always safe.
 * The completion screen is not a step — it renders when the submission
 * succeeds (or on the Worker's ?sent=1 redirect).
 */
type StepId =
  | "start"
  | "destination"
  | "locations"
  | "job-types"
  | "salary"
  | "documents"
  | "passport"
  | "background"
  | "taiwan-intro"
  | "contact";

const CHINA_ROUTE: readonly StepId[] = [
  "start",
  "destination",
  "locations",
  "job-types",
  "salary",
  "documents",
  "passport",
  "background",
  "contact",
];

// TODO(Taiwan): Barry's Taiwan question set is still being written. When it
// lands, replace "taiwan-intro" with the real steps (and their validation,
// payload fields and Worker rules) — the route mechanism needs no change.
const TAIWAN_ROUTE: readonly StepId[] = [
  "start",
  "destination",
  "taiwan-intro",
  "contact",
];

function routeFor(destination: Destination): readonly StepId[] {
  return destination === "taiwan" ? TAIWAN_ROUTE : CHINA_ROUTE;
}

function validateStep(stepId: StepId, a: Answers): string | null {
  switch (stepId) {
    case "destination":
      return a.destination
        ? null
        : "Choose where you'd like to teach to continue.";
    case "locations":
      return a.anyLocation || a.locations.trim().length > 0
        ? null
        : "Tell us where you'd like to teach, or tick the box if anywhere suits you.";
    case "job-types":
      return a.jobTypes.length > 0
        ? null
        : "Choose at least one type of school to continue.";
    case "salary":
      return /^\d{1,7}$/.test(a.salaryRmb) && Number(a.salaryRmb) >= 1
        ? null
        : "Please enter a whole number of RMB, e.g. 20000.";
    case "documents":
      return a.docDegree && a.docTeachingCert && a.docBackgroundCheck
        ? null
        : "Choose an answer for each of the three documents.";
    case "passport":
      return a.passportCountry && a.passportExpiryMonth && a.passportExpiryYear
        ? null
        : "Choose your passport's country and its expiry month and year.";
    case "background":
      return a.backgroundCheck
        ? null
        : "Choose one of the two options to continue.";
    case "contact":
      if (a.name.trim().length === 0) return "Please enter your name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim()))
        return "Please enter a valid email address.";
      if (!a.cvFile) return "Please attach your CV to finish.";
      return null;
    default:
      return null;
  }
}

/** Client-side CV checks — the Worker re-checks all of this server-side. */
function cvProblem(file: File): string | null {
  if (!/\.(pdf|doc|docx)$/.test(file.name.toLowerCase()))
    return "Please attach your CV as a PDF or Word document (.pdf, .doc or .docx).";
  if (file.size === 0 || file.size > MAX_CV_BYTES)
    return "Your CV needs to be under 5 MB — a PDF export usually is.";
  return null;
}

const labelCls = "block text-fine font-medium text-channel";
const fieldCls =
  "mt-1.5 w-full rounded-btn border-[1.5px] bg-white px-3.5 py-2.5 text-ink";
const hintCls = "mt-1 text-fine text-flint";

/** Border swaps to rust on the step's flagged control (styleguide pattern). */
function fieldBorder(invalid: boolean): string {
  return `${fieldCls} ${invalid ? "border-rust" : "border-gull"}`;
}

/** One three-way radio group on the documents step. No hooks — plain JSX. */
function StatusRadios({
  legend,
  hint,
  group,
  value,
  onChange,
}: {
  legend: string;
  hint: string;
  group: string;
  value: DocStatus;
  onChange: (next: DocStatus) => void;
}) {
  return (
    <fieldset>
      <legend className={labelCls}>{legend}</legend>
      <p className={hintCls}>{hint}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {DOC_STATUSES.map(([val, label]) => (
          <label
            key={val}
            className={`flex cursor-pointer items-center gap-2 rounded-btn border-[1.5px] px-3.5 py-2 text-fine transition-colors duration-150 ease-out ${
              value === val
                ? "border-harbour bg-foam text-harbour-deep"
                : "border-gull text-flint hover:border-harbour"
            }`}
          >
            <input
              type="radio"
              name={group}
              value={val}
              checked={value === val}
              onChange={() => onChange(val)}
              className="accent-harbour"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Full-width radio cards (destination and background steps). No hooks. */
function ChoiceCards({
  legend,
  group,
  options,
  value,
  onChange,
}: {
  legend: string;
  group: string;
  options: readonly (readonly [string, string])[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="space-y-2.5">
        {options.map(([val, label]) => (
          <label
            key={val}
            className={`flex cursor-pointer items-center gap-3 rounded-btn border-[1.5px] px-4 py-3 transition-colors duration-150 ease-out ${
              value === val
                ? "border-harbour bg-foam text-harbour-deep"
                : "border-gull text-ink hover:border-harbour"
            }`}
          >
            <input
              type="radio"
              name={group}
              value={val}
              checked={value === val}
              onChange={() => onChange(val)}
              className="accent-harbour"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// Same server-snapshot pattern as ContactForm: false during prerender,
// true on the client, without a set-state-in-effect.
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

export function ProfileWizard() {
  const mounted = useMounted();
  // A no-JS submit could never reach the Worker (Turnstile needs JS), but
  // the Worker's success answer is still a 303 to /profile?sent=1.
  const sentViaRedirect = new URLSearchParams(useSearch()).get("sent") === "1";
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [stepError, setStepError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const route = routeFor(answers.destination);
  const stepId = route[stepIndex];

  // Time-trap stamp (PLAN §8.3), set through a ref after hydration so the
  // static HTML carries no build-time value and nothing mismatches. Set at
  // wizard mount — a real fill takes minutes, comfortably over the trap.
  const startedRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  // Move focus to the incoming step's heading (not on initial mount) so
  // keyboard and screen-reader users land at the top of the new screen.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prevStepRef = useRef(0);
  useEffect(() => {
    if (prevStepRef.current !== stepIndex) {
      prevStepRef.current = stepIndex;
      headingRef.current?.focus();
    }
  }, [stepIndex]);

  // Turnstile explicit render: the script's implicit scan ran long before
  // the widget container mounts on the contact step, so render it by hand,
  // polling briefly in case the script itself is still loading. The
  // childElementCount guard stops a double render (React strict mode).
  const turnstileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (stepId !== "contact") return;
    const el = turnstileRef.current;
    if (!el) return;
    const tryRender = () => {
      if (el.childElementCount > 0) return true;
      if (!window.turnstile?.render) return false;
      window.turnstile.render(el, { sitekey: TURNSTILE_SITE_KEY });
      return true;
    };
    if (tryRender()) return;
    const id = window.setInterval(() => {
      if (tryRender()) window.clearInterval(id);
    }, 200);
    return () => window.clearInterval(id);
  }, [stepId]);

  function patch(partial: Partial<Answers>) {
    setAnswers((a) => ({ ...a, ...partial }));
    setStepError(null);
  }

  function back() {
    setStepError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateStep(stepId, answers);
    if (error) {
      setStepError(error);
      return;
    }
    if (stepId !== "contact") {
      setStepError(null);
      setStepIndex((i) => i + 1);
      return;
    }

    // Final submit. The live form only holds the contact step's inputs
    // plus the honeypot, time-trap and Turnstile fields; every earlier
    // answer is written in from state. The CV also comes from state so a
    // Back/Next round trip can't lose it. The Taiwan route sends only the
    // destination and contact details — its questions don't exist yet.
    const cv = answers.cvFile;
    if (!cv) return; // validateStep already guarantees this
    const problem = cvProblem(cv);
    if (problem) {
      setStepError(problem);
      return;
    }
    const form = event.currentTarget;
    const fd = new FormData(form);
    fd.set("destination", answers.destination);
    if (answers.destination !== "taiwan") {
      fd.set("locations", answers.locations.trim());
      fd.set("any_location", answers.anyLocation ? "yes" : "");
      fd.delete("job_types");
      for (const type of answers.jobTypes) fd.append("job_types", type);
      fd.set("salary_rmb", answers.salaryRmb);
      fd.set("doc_degree_apostille", answers.docDegree);
      fd.set("doc_teaching_certificate", answers.docTeachingCert);
      fd.set("doc_background_check", answers.docBackgroundCheck);
      fd.set("passport_country", answers.passportCountry);
      fd.set("passport_expiry_month", answers.passportExpiryMonth);
      fd.set("passport_expiry_year", answers.passportExpiryYear);
      fd.set("background_check", answers.backgroundCheck);
    }
    fd.set("cv", cv, cv.name);

    setStatus("sending");
    try {
      // redirect: "manual" — the Worker answers 303 on success; no need to
      // follow it and refetch this page.
      const res = await fetch(PROFILE_ENDPOINT, {
        method: "POST",
        body: fd,
        redirect: "manual",
      });
      if (res.type === "opaqueredirect" || res.ok) {
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
        <h2 className="text-h3">Profile sent</h2>
        <p className="mt-3 text-flint">
          Thank you — Barry reads every profile himself and will reply to the
          email address you gave. If you don&rsquo;t hear back within a few
          days, write to us directly at{" "}
          <span className="select-all text-ink">{APPLY_EMAIL}</span>.
        </p>
      </div>
    );
  }

  const invalid = stepError !== null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <form
        method="post"
        action={PROFILE_ENDPOINT}
        encType="multipart/form-data"
        onSubmit={onSubmit}
        noValidate
        hidden={!mounted}
      >
        {stepIndex >= 1 && (
          <p className="text-fine font-medium text-harbour tnum">
            Step {stepIndex} of {route.length - 1}
          </p>
        )}

        <div key={stepId} className="step-in mt-4 space-y-5">
          {stepId === "start" && (
            <>
              <h2 ref={headingRef} tabIndex={-1} className="text-h3">
                How it works
              </h2>
              <ul className="list-disc space-y-2 pl-5 text-flint">
                <li>
                  A handful of short questions — where you&rsquo;d like to
                  teach, the type of school, salary, your documents, your
                  passport and your background check.
                </li>
                <li>Then your name, email address and CV.</li>
                <li>
                  It takes about two minutes, and your profile goes straight
                  to Barry by email — nothing is stored on this website.
                </li>
              </ul>
            </>
          )}

          {stepId === "destination" && (
            <>
              <h2 ref={headingRef} tabIndex={-1} className="text-h3">
                Where would you like to teach?
              </h2>
              <ChoiceCards
                legend="Where would you like to teach?"
                group="wizard-destination"
                options={DESTINATIONS}
                value={answers.destination}
                onChange={(v) =>
                  patch({ destination: v as Answers["destination"] })
                }
              />
            </>
          )}

          {stepId === "locations" && (
            <>
              <h2 ref={headingRef} tabIndex={-1} className="text-h3">
                Whereabouts would suit you?
              </h2>
              <div>
                <label htmlFor="profile-locations" className={labelCls}>
                  Preferred locations
                </label>
                <p className={hintCls} id="profile-locations-hint">
                  Cities, provinces, or anything in between.
                </p>
                <textarea
                  id="profile-locations"
                  rows={4}
                  maxLength={2000}
                  value={answers.locations}
                  onChange={(e) => patch({ locations: e.target.value })}
                  aria-describedby="profile-locations-hint"
                  aria-invalid={invalid && !answers.anyLocation}
                  className={fieldBorder(invalid && !answers.anyLocation)}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 text-ink">
                <input
                  type="checkbox"
                  checked={answers.anyLocation}
                  onChange={(e) => patch({ anyLocation: e.target.checked })}
                  className="size-4 accent-harbour"
                />
                I&rsquo;m open to any location
              </label>
              {answers.anyLocation && (
                <p className={hintCls}>
                  Lovely — any preferences you note above are still welcome.
                </p>
              )}
            </>
          )}

          {stepId === "job-types" && (
            <>
              <h2 ref={headingRef} tabIndex={-1} className="text-h3">
                What type of school suits you?
              </h2>
              <div>
                <label htmlFor="profile-job-types" className={labelCls}>
                  Preferred job types
                </label>
                <p className={hintCls} id="profile-job-types-hint">
                  Choose as many as you like.
                </p>
                <Dropdown
                  id="profile-job-types"
                  placeholder="Choose types of school"
                  options={JOB_TYPES}
                  values={answers.jobTypes}
                  onChange={(values) => patch({ jobTypes: values })}
                  multiple
                  invalid={invalid}
                />
              </div>
            </>
          )}

          {stepId === "salary" && (
            <>
              <h2 ref={headingRef} tabIndex={-1} className="text-h3">
                What salary are you hoping for?
              </h2>
              <div>
                <label htmlFor="profile-salary" className={labelCls}>
                  Monthly salary
                </label>
                <p className={hintCls} id="profile-salary-hint">
                  A rough estimate is fine — a whole number, before deductions.
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                  <input
                    id="profile-salary"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={7}
                    value={answers.salaryRmb}
                    onChange={(e) => patch({ salaryRmb: e.target.value })}
                    aria-describedby="profile-salary-hint"
                    aria-invalid={invalid}
                    className={`w-40 rounded-btn border-[1.5px] bg-white px-3.5 py-2.5 text-ink tnum ${
                      invalid ? "border-rust" : "border-gull"
                    }`}
                  />
                  <span className="text-fine text-flint">RMB per month</span>
                </div>
              </div>
            </>
          )}

          {stepId === "documents" && (
            <>
              <h2 ref={headingRef} tabIndex={-1} className="text-h3">
                How ready are your documents?
              </h2>
              <p className="text-flint">
                No problem if you haven&rsquo;t started — we help candidates
                through all three.
              </p>
              <StatusRadios
                legend="Apostille of your degree"
                hint="An apostille certifies your degree for use abroad."
                group="wizard-doc-degree"
                value={answers.docDegree}
                onChange={(v) => patch({ docDegree: v })}
              />
              <StatusRadios
                legend="Teaching certificate"
                hint="TEFL, TESOL, CELTA, PGCE, or similar."
                group="wizard-doc-cert"
                value={answers.docTeachingCert}
                onChange={(v) => patch({ docTeachingCert: v })}
              />
              <StatusRadios
                legend="Recent background check"
                hint="A criminal-record check from your home country — a DBS check in the UK."
                group="wizard-doc-check"
                value={answers.docBackgroundCheck}
                onChange={(v) => patch({ docBackgroundCheck: v })}
              />
            </>
          )}

          {stepId === "passport" && (
            <>
              <h2 ref={headingRef} tabIndex={-1} className="text-h3">
                Your passport
              </h2>
              <div>
                <label htmlFor="profile-passport-country" className={labelCls}>
                  Country of issue
                </label>
                <Dropdown
                  id="profile-passport-country"
                  placeholder="Choose a country"
                  options={PASSPORT_COUNTRIES}
                  values={
                    answers.passportCountry ? [answers.passportCountry] : []
                  }
                  onChange={([value]) => patch({ passportCountry: value })}
                  invalid={invalid && !answers.passportCountry}
                />
              </div>
              <fieldset>
                <legend className={labelCls}>Expiry date</legend>
                <div className="flex flex-wrap gap-3">
                  <div className="min-w-40 flex-1">
                    <label htmlFor="profile-expiry-month" className="sr-only">
                      Expiry month
                    </label>
                    <Dropdown
                      id="profile-expiry-month"
                      placeholder="Month"
                      options={MONTHS}
                      values={
                        answers.passportExpiryMonth
                          ? [answers.passportExpiryMonth]
                          : []
                      }
                      onChange={([value]) =>
                        patch({ passportExpiryMonth: value })
                      }
                      invalid={invalid && !answers.passportExpiryMonth}
                    />
                  </div>
                  <div className="min-w-28 flex-1">
                    <label htmlFor="profile-expiry-year" className="sr-only">
                      Expiry year
                    </label>
                    <Dropdown
                      id="profile-expiry-year"
                      placeholder="Year"
                      options={EXPIRY_YEARS}
                      values={
                        answers.passportExpiryYear
                          ? [answers.passportExpiryYear]
                          : []
                      }
                      onChange={([value]) =>
                        patch({ passportExpiryYear: value })
                      }
                      invalid={invalid && !answers.passportExpiryYear}
                    />
                  </div>
                </div>
              </fieldset>
            </>
          )}

          {stepId === "background" && (
            <>
              <h2 ref={headingRef} tabIndex={-1} className="text-h3">
                Your background check
              </h2>
              <ChoiceCards
                legend="Background check status"
                group="wizard-background"
                options={
                  [
                    ["clean", "My background check is clean"],
                    ["disclose", "I have something to disclose"],
                  ] as const
                }
                value={answers.backgroundCheck}
                onChange={(v) =>
                  patch({ backgroundCheck: v as Answers["backgroundCheck"] })
                }
              />
              {answers.backgroundCheck === "disclose" && (
                <p className="text-flint">
                  That&rsquo;s fine — we deliberately don&rsquo;t ask for any
                  detail here. Barry will discuss it with you privately, and
                  it doesn&rsquo;t rule you out of the conversation.
                </p>
              )}
            </>
          )}

          {stepId === "taiwan-intro" && (
            <>
              <h2 ref={headingRef} tabIndex={-1} className="text-h3">
                Teaching in Taiwan
              </h2>
              <p className="text-flint">
                Our Taiwan questions are still being written, so this is the
                short version: leave your name, email address and CV on the
                next screen, and Barry will pick things up with you directly
                by email.
              </p>
            </>
          )}

          {stepId === "contact" && (
            <>
              <h2 ref={headingRef} tabIndex={-1} className="text-h3">
                Nearly there — how do we reach you?
              </h2>
              <div>
                <label htmlFor="profile-name" className={labelCls}>
                  Name
                </label>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  maxLength={200}
                  autoComplete="name"
                  value={answers.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  aria-invalid={invalid && answers.name.trim() === ""}
                  className={fieldBorder(invalid && answers.name.trim() === "")}
                />
              </div>
              <div>
                <label htmlFor="profile-email" className={labelCls}>
                  Email address
                </label>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  value={answers.email}
                  onChange={(e) => patch({ email: e.target.value })}
                  aria-invalid={
                    invalid &&
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email.trim())
                  }
                  className={fieldBorder(
                    invalid &&
                      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email.trim()),
                  )}
                />
              </div>
              <div>
                <label htmlFor="profile-cv" className={labelCls}>
                  Your CV
                </label>
                <p className={hintCls} id="profile-cv-hint">
                  PDF or Word document, up to 5 MB. It is emailed to Barry and
                  never stored on this website.
                </p>
                <input
                  id="profile-cv"
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (file) {
                      const problem = cvProblem(file);
                      if (problem) {
                        setStepError(problem);
                        e.target.value = "";
                        return;
                      }
                    }
                    patch({ cvFile: file });
                  }}
                  aria-describedby="profile-cv-hint"
                  aria-invalid={invalid && !answers.cvFile}
                  className="mt-1.5 w-full text-fine text-flint file:mr-3 file:cursor-pointer file:rounded-btn file:border-[1.5px] file:border-harbour file:bg-white file:px-4 file:py-2 file:font-medium file:text-harbour-deep file:transition-colors file:duration-150 file:ease-out hover:file:bg-foam"
                />
                {answers.cvFile && (
                  <p className={hintCls}>
                    Selected:{" "}
                    <span className="text-ink">{answers.cvFile.name}</span>
                  </p>
                )}
              </div>

              {/* Turnstile (PLAN §14.2), rendered explicitly — see the
                  effect above. Adds a hidden cf-turnstile-response input. */}
              <div ref={turnstileRef} />
            </>
          )}
        </div>

        {/* Honeypot (PLAN §8.3): invisible to people, tempting to bots.
            Any value makes the Worker silently drop the submission. */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="profile-website">Website</label>
          <input
            id="profile-website"
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

        {stepError && (
          <p role="alert" className="mt-5 text-fine text-rust">
            {stepError}
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="mt-5 text-fine text-rust">
            Sorry — your profile could not be sent. Please email your CV to us
            instead at{" "}
            <a
              href={`mailto:${APPLY_EMAIL}`}
              className="select-all font-medium underline underline-offset-4"
            >
              {APPLY_EMAIL}
            </a>
            .
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          {stepId !== "start" && (
            <Button variant="secondary" type="button" onClick={back}>
              Back
            </Button>
          )}
          {stepId === "start" && <Button type="submit">Start</Button>}
          {stepId !== "start" && stepId !== "contact" && (
            <Button type="submit">Next</Button>
          )}
          {stepId === "contact" && (
            <button
              type="submit"
              disabled={status === "sending"}
              className="inline-flex items-center justify-center rounded-btn bg-harbour px-5 py-2.5 font-medium text-chalk transition-colors duration-150 ease-out hover:bg-harbour-deep disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send profile"}
            </button>
          )}
        </div>

        {stepId === "contact" && (
          <p className="mt-5 text-[0.8125rem] text-flint">
            This form collects your answers, your name and email address, and
            your CV, so Barry can get in touch about placements. It is sent to
            us by email and never stored on this website. See our{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 transition-colors duration-150 hover:text-harbour-deep"
            >
              privacy policy
            </Link>
            .
          </p>
        )}
      </form>
    </>
  );
}
