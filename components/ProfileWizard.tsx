"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { Gull } from "@/components/Gull";
import { APPLY_EMAIL } from "@/lib/site";

/**
 * The Teacher Profile wizard (PLAN amendment 2 Sep 2026 (profile)): a
 * start screen, a China/Taiwan destination question that FORKS the route,
 * the question steps, a contact-details step with CV upload, and a
 * completion screen — one static route, screens switched in React state.
 *
 * Routes (PLAN amendment 2 Sep 2026 (profile), Taiwan addendum): China
 * gets the six China questions; Taiwan gets an intro plus Barry's Taiwan
 * set — on-campus degree, age groups, passport, the named national
 * background check and its age, the clean/disclose flag; "open to either"
 * runs the China set plus the two Taiwan-only questions. Disqualifying
 * answers are soft flags: a note for the candidate, a label for Barry,
 * never a dead end.
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

// The Taiwan set (Barry's brief, 6 Sep 2026 — PLAN amendment 2 Sep 2026
// (profile), Taiwan addendum).
const DEGREE_OPTIONS = [
  ["yes", "Completed on campus"],
  ["no", "Completed online"],
] as const;

const AGE_GROUP_OPTIONS = [
  ["any_3_16", "Any age from 3 to 16"],
  ["7_12_only", "Ages 7 to 12 only"],
  ["older_only", "I'd rather teach older students"],
] as const;

const CHECK_RECENT_OPTIONS = [
  ["yes", "Yes"],
  ["no", "No, it's older than that"],
] as const;

// The national check Taiwan asks for, by passport country (Barry's list).
// South Africa and Other are not on it, so they fall back to generic
// wording rather than an invented name.
const CHECK_NAMES: Partial<Record<string, string>> = {
  uk: "Basic DBS check",
  ireland: "Garda Police Certificate",
  usa: "FBI background check",
  canada: "RCMP criminal record check",
  australia: "AFP National Police Check",
  new_zealand: "Ministry of Justice Criminal Record Check",
};

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
  // Taiwan set. checkRecent only means anything when docBackgroundCheck
  // is "done" — it is the "less than six months old?" follow-up.
  degreeOnCampus: "" | "yes" | "no";
  ageGroups: "" | "any_3_16" | "7_12_only" | "older_only";
  checkRecent: "" | "yes" | "no";
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
  degreeOnCampus: "",
  ageGroups: "",
  checkRecent: "",
  name: "",
  email: "",
  cvFile: null,
};

/**
 * The wizard is a walk along a route of step ids, and the destination
 * answer picks the route. All routes share the [start, destination]
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
  | "taiwan-degree"
  | "taiwan-ages"
  | "taiwan-check"
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

// Passport sits before the check step so the step can name the check for
// the chosen country. Both routes end with the clean/disclose flag.
const TAIWAN_ROUTE: readonly StepId[] = [
  "start",
  "destination",
  "taiwan-intro",
  "taiwan-degree",
  "taiwan-ages",
  "passport",
  "taiwan-check",
  "background",
  "contact",
];

// "Open to either": the China set plus the two Taiwan-only questions. The
// background check's age is asked on the documents step, so no check step.
const EITHER_ROUTE: readonly StepId[] = [
  "start",
  "destination",
  "locations",
  "job-types",
  "salary",
  "documents",
  "taiwan-degree",
  "taiwan-ages",
  "passport",
  "background",
  "contact",
];

function routeFor(destination: Destination): readonly StepId[] {
  if (destination === "taiwan") return TAIWAN_ROUTE;
  if (destination === "either") return EITHER_ROUTE;
  return CHINA_ROUTE;
}

/** "Done" needs the six-months follow-up answered; anything else doesn't. */
function checkRecencyMissing(a: Answers): boolean {
  return a.docBackgroundCheck === "done" && a.checkRecent === "";
}

/** The Taiwan check step's lead line is built from the passport country. */
function checkNameFor(country: string): string {
  return CHECK_NAMES[country] ?? "national criminal record check";
}
// "an FBI", "an RCMP", "an AFP" — the initialisms that start with a vowel
// sound. Everything else on Barry's list takes "a".
const CHECK_TAKES_AN = new Set(["usa", "canada", "australia"]);
function checkArticle(country: string): string {
  return CHECK_TAKES_AN.has(country) ? "an" : "a";
}
function countryLabel(country: string): string {
  return PASSPORT_COUNTRIES.find(([val]) => val === country)?.[1] ?? country;
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
      if (!(a.docDegree && a.docTeachingCert && a.docBackgroundCheck))
        return "Choose an answer for each of the three documents.";
      return checkRecencyMissing(a)
        ? "Tell us whether your background check is less than six months old."
        : null;
    case "taiwan-degree":
      return a.degreeOnCampus
        ? null
        : "Choose one of the two options to continue.";
    case "taiwan-ages":
      return a.ageGroups ? null : "Choose one of the options to continue.";
    case "taiwan-check":
      if (!a.docBackgroundCheck)
        return "Tell us where you've got to with your background check.";
      return checkRecencyMissing(a)
        ? "Tell us whether your background check is less than six months old."
        : null;
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

/**
 * One row of chip radios — the three document statuses by default, or any
 * short option list (the six-months follow-up). No hooks — plain JSX.
 */
function StatusRadios<T extends string>({
  legend,
  hint,
  group,
  options,
  value,
  onChange,
}: {
  legend: string;
  hint?: string;
  group: string;
  options: readonly (readonly [T, string])[];
  value: T | "";
  onChange: (next: T) => void;
}) {
  return (
    <fieldset>
      <legend className={labelCls}>{legend}</legend>
      {hint && <p className={hintCls}>{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map(([val, label]) => (
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
    // Back/Next round trip can't lose it. Three blocks, mirroring the
    // Worker's validation: every route, China-set routes, Taiwan-set routes.
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
    fd.set("passport_country", answers.passportCountry);
    fd.set("passport_expiry_month", answers.passportExpiryMonth);
    fd.set("passport_expiry_year", answers.passportExpiryYear);
    fd.set("background_check", answers.backgroundCheck);
    fd.set("doc_background_check", answers.docBackgroundCheck);
    fd.set(
      "check_recent",
      answers.docBackgroundCheck === "done" ? answers.checkRecent : "",
    );
    if (answers.destination !== "taiwan") {
      fd.set("locations", answers.locations.trim());
      fd.set("any_location", answers.anyLocation ? "yes" : "");
      fd.delete("job_types");
      for (const type of answers.jobTypes) fd.append("job_types", type);
      fd.set("salary_rmb", answers.salaryRmb);
      fd.set("doc_degree_apostille", answers.docDegree);
      fd.set("doc_teaching_certificate", answers.docTeachingCert);
    }
    if (answers.destination !== "china") {
      fd.set("degree_on_campus", answers.degreeOnCampus);
      fd.set("age_groups", answers.ageGroups);
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
        <Gull withHorizon={false} className="h-6 w-12 text-harbour" />
        <h2 className="mt-2 text-h3">Profile sent</h2>
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
                  teach, your qualifications, your passport and your
                  background check.
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
                options={DOC_STATUSES}
                value={answers.docDegree}
                onChange={(v) => patch({ docDegree: v })}
              />
              <StatusRadios
                legend="Teaching certificate"
                hint="TEFL, TESOL, CELTA, PGCE, or similar."
                group="wizard-doc-cert"
                options={DOC_STATUSES}
                value={answers.docTeachingCert}
                onChange={(v) => patch({ docTeachingCert: v })}
              />
              <StatusRadios
                legend="Recent background check"
                hint="A criminal-record check from your home country — a DBS check in the UK."
                group="wizard-doc-check"
                options={DOC_STATUSES}
                value={answers.docBackgroundCheck}
                onChange={(v) => patch({ docBackgroundCheck: v })}
              />
              {answers.docBackgroundCheck === "done" && (
                <StatusRadios
                  legend="Is it less than six months old?"
                  group="wizard-check-recent"
                  options={CHECK_RECENT_OPTIONS}
                  value={answers.checkRecent}
                  onChange={(v) => patch({ checkRecent: v })}
                />
              )}
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
              {answers.destination !== "china" && (
                <p className={hintCls}>
                  For Taiwan, minor offences such as a DUI are normally
                  accepted.
                </p>
              )}
              {answers.backgroundCheck === "disclose" && (
                <p className="text-flint">
                  That&rsquo;s fine — we deliberately don&rsquo;t ask for any
                  detail here. Barry will discuss it with you privately, and
                  it doesn&rsquo;t rule you out of the conversation.
                </p>
              )}
            </>
          )}

          {/* The Taiwan set — Barry's brief, 6 Sep 2026. Information first
              (buxibans, ages, no apostille), then the questions. */}
          {stepId === "taiwan-intro" && (
            <>
              <h2 ref={headingRef} tabIndex={-1} className="text-h3">
                Teaching in Taiwan
              </h2>
              <p className="text-flint">
                Our Taiwan positions are at buxibans — private language
                academies rather than state schools, much like training
                centres in China or hagwons in Korea. The pupils are
                children, aged 3 to 16 or 7 to 12 depending on the position.
              </p>
              <p className="text-flint">
                Neither your degree nor your background check needs an
                apostille for Taiwan. The next few questions cover your
                degree, the ages you&rsquo;d teach, your passport and your
                background check.
              </p>
            </>
          )}

          {stepId === "taiwan-degree" && (
            <>
              <h2 ref={headingRef} tabIndex={-1} className="text-h3">
                Your bachelor&rsquo;s degree
              </h2>
              <ChoiceCards
                legend="How was your bachelor's degree completed?"
                group="wizard-degree"
                options={DEGREE_OPTIONS}
                value={answers.degreeOnCampus}
                onChange={(v) =>
                  patch({ degreeOnCampus: v as Answers["degreeOnCampus"] })
                }
              />
              {answers.degreeOnCampus === "no" && (
                <p className="text-flint">
                  Taiwan&rsquo;s work-permit rules don&rsquo;t accept online
                  degrees, so Barry may suggest mainland China instead. You
                  can still send your profile.
                </p>
              )}
            </>
          )}

          {stepId === "taiwan-ages" && (
            <>
              <h2 ref={headingRef} tabIndex={-1} className="text-h3">
                Which ages are you happy to teach?
              </h2>
              <ChoiceCards
                legend="Which ages are you happy to teach?"
                group="wizard-ages"
                options={AGE_GROUP_OPTIONS}
                value={answers.ageGroups}
                onChange={(v) =>
                  patch({ ageGroups: v as Answers["ageGroups"] })
                }
              />
              {answers.ageGroups === "older_only" && (
                <p className="text-flint">
                  Our Taiwan positions are all with children, so Barry may
                  suggest mainland China instead. You can still send your
                  profile.
                </p>
              )}
            </>
          )}

          {stepId === "taiwan-check" && (
            <>
              {/* Not "Your background check" — that is the next step's
                  heading, and two identical headings in a row read as a
                  mistake. */}
              <h2 ref={headingRef} tabIndex={-1} className="text-h3">
                Your police check
              </h2>
              <p className="text-flint">
                {CHECK_NAMES[answers.passportCountry] ? (
                  <>
                    For a {countryLabel(answers.passportCountry)} passport,
                    Taiwan asks for {checkArticle(answers.passportCountry)}{" "}
                    {checkNameFor(answers.passportCountry)}, less than six
                    months old when you apply.
                  </>
                ) : (
                  <>
                    Taiwan asks for a national criminal record check from
                    your country&rsquo;s police, less than six months old
                    when you apply.
                  </>
                )}
              </p>
              <StatusRadios
                legend="Where have you got to?"
                hint="It doesn't need an apostille."
                group="wizard-taiwan-check"
                options={DOC_STATUSES}
                value={answers.docBackgroundCheck}
                onChange={(v) => patch({ docBackgroundCheck: v })}
              />
              {answers.docBackgroundCheck === "done" && (
                <StatusRadios
                  legend="Is it less than six months old?"
                  group="wizard-check-recent"
                  options={CHECK_RECENT_OPTIONS}
                  value={answers.checkRecent}
                  onChange={(v) => patch({ checkRecent: v })}
                />
              )}
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
