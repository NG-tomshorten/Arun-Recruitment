import { useId } from "react";

/**
 * The shore — a live water's edge under the home hero (still PLAN §11.3's
 * single wave motif, animated). Three teal swells drift sideways while
 * rising and falling out of phase, and a chalk foam line breaks along the
 * front wave's crest. CSS-only: the drift/swell keyframes live in
 * globals.css, and the global prefers-reduced-motion rule stills the whole
 * sea into a static shoreline. Decorative only — always aria-hidden.
 *
 * ponytail: rolling swell, not literal breaking surf — curling crests and
 * spray would need canvas/JS, add only if the real thing is wanted.
 */
const LAYERS = [
  // back → front: fainter and slower at the back. Negative delays desync the
  // swells so crests roll in one after another; phase offsets stop the wave
  // repeats lining up vertically.
  {
    height: 60,
    opacity: 0.16,
    drift: "13s",
    swell: "6.5s",
    delay: "0s",
    reverse: false,
    phase: 0,
    foam: false,
  },
  {
    height: 48,
    opacity: 0.3,
    drift: "9s",
    swell: "5.2s",
    delay: "-3.5s",
    reverse: true,
    phase: 37,
    foam: false,
  },
  {
    height: 34,
    opacity: 0.55,
    drift: "6.5s",
    swell: "4.2s",
    delay: "-1.6s",
    reverse: false,
    phase: 74,
    foam: true,
  },
] as const;

export function Shore({ className }: { className?: string }) {
  const id = useId();
  return (
    <div
      aria-hidden="true"
      className={`relative h-14 overflow-hidden text-brand-teal ${className ?? ""}`}
    >
      {LAYERS.map((layer, i) => (
        <div
          key={i}
          className="absolute inset-x-0"
          style={{
            /* anchored 10px below the container so the upward swell never
               opens a chalk gap under the water */
            bottom: -10,
            animation: `shore-swell ${layer.swell} ease-in-out ${layer.delay} infinite alternate`,
          }}
        >
          <svg
            className="block"
            style={{
              /* one extra repeat off-screen so the 112px drift never shows an edge */
              width: "calc(100% + 112px)",
              height: layer.height,
              animation: `shore-drift ${layer.drift} linear infinite${
                layer.reverse ? " reverse" : ""
              }`,
            }}
          >
            <defs>
              <pattern
                id={`${id}-${i}`}
                x={layer.phase}
                width="112"
                height={layer.height}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M0 12 Q28 2 56 12 T112 12 V${layer.height} H0 Z`}
                  fill="currentColor"
                  opacity={layer.opacity}
                />
                {layer.foam && (
                  <path
                    d="M0 10 Q28 0 56 10 T112 10"
                    fill="none"
                    stroke="var(--color-chalk)"
                    strokeWidth="2.5"
                    opacity="0.9"
                  />
                )}
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${id}-${i})`} />
          </svg>
        </div>
      ))}
    </div>
  );
}
