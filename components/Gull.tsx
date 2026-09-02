/**
 * The gull — one minimal two-stroke glyph: a distant gull over a horizon line.
 * Permitted placements: footer horizon rule, 404 and the /profile completion
 * card only. (The wordmark and favicon carry the real three-gull brand mark
 * from brand/ — see PLAN §11.3, amended when Barry's media pack arrived.)
 * Never repeated, patterned, or animated.
 */
export function Gull({
  withHorizon = true,
  className,
}: {
  withHorizon?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {withHorizon && (
        <path
          d="M2 19.5H46"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.55"
        />
      )}
      <path
        d="M19 11.5Q23 6.5 26.5 10.5Q30 6.5 34 11.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
