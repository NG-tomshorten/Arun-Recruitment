import { APPLY_EMAIL } from "@/lib/site";

/**
 * The apply panel (PLAN §6, §7): a mailto button with a pre-filled subject
 * naming the role — so Barry can tell at a glance which job an email is
 * about — and the address as selectable text for anyone whose mailto
 * handler is broken. Desktop: sticky right rail. Mobile: fixed bottom bar
 * (rendered separately by the job page).
 *
 * No forms, no uploads, nothing stored (CLAUDE.md guardrail 4).
 */

export function applyHref(title: string): string {
  const subject = encodeURIComponent(`Application: ${title}`);
  const body = encodeURIComponent(
    "Please attach your CV, and tell us your nationality and your teaching qualifications.\n\n",
  );
  return `mailto:${APPLY_EMAIL}?subject=${subject}&body=${body}`;
}

export function ApplyPanel({ title }: { title: string }) {
  return (
    <div className="rounded-card border border-gull bg-chalk p-6 shadow-haze">
      <h2 className="text-h3">Apply for this role</h2>
      <p className="mt-3 text-fine text-flint">
        Email us your CV, your nationality and your teaching qualifications.
        We reply to every application.
      </p>
      <a
        href={applyHref(title)}
        className="mt-5 inline-flex w-full items-center justify-center rounded-btn bg-harbour px-5 py-3 font-medium text-chalk transition-colors duration-150 ease-out hover:bg-harbour-deep"
      >
        Apply by email
      </a>
      <p className="mt-4 text-[0.8125rem] text-flint">
        Or write to <span className="select-all">{APPLY_EMAIL}</span>
        {" with the subject "}
        &ldquo;Application: {title}&rdquo;.
      </p>
    </div>
  );
}
