import { useId } from "react";

/**
 * The tide line — a 1px, low-amplitude wave rule (PLAN §11.3), drawn in the
 * brand teal (the water gets the brand colour). Section divider and kicker
 * underline. The only wave on the site.
 */
export function TideLine({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg
      height="10"
      aria-hidden="true"
      className={`w-full text-brand-teal ${className ?? ""}`}
    >
      <defs>
        <pattern
          id={id}
          width="28"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 5 Q7 1.5 14 5 T28 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="10" fill={`url(#${id})`} />
    </svg>
  );
}
