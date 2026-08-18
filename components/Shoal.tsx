/**
 * The shoal — small fish cruising the sea-fade section on the home page,
 * with a shark passing through every couple of minutes that takes one of
 * them. CSS-only: slow linear traverses (fish-swim / shark-swim /
 * fish-victim) paired with an ease-in-out bob (fish-bob), all in
 * globals.css. Varied speeds, depths, sizes and staggered negative delays
 * make the motion read as random while staying deterministic. The global
 * prefers-reduced-motion rule stills the whole scene.
 * Decorative only — always aria-hidden, never interactive.
 */
const FISH = [
  // top = depth in the section; shallow fish are dark (channel), deep fish
  // pale (chalk). Negative delays scatter them across the width on load.
  { top: "12%", size: 30, swim: "42s", delay: "-3s", bob: "4.6s", bobDelay: "0s", color: "text-channel", opacity: 0.4, reverse: false },
  { top: "22%", size: 20, swim: "30s", delay: "-18s", bob: "3.8s", bobDelay: "-1.3s", color: "text-channel", opacity: 0.35, reverse: true },
  { top: "34%", size: 40, swim: "55s", delay: "-30s", bob: "5.4s", bobDelay: "-2s", color: "text-channel", opacity: 0.3, reverse: false },
  { top: "48%", size: 26, swim: "36s", delay: "-10s", bob: "4.2s", bobDelay: "-0.7s", color: "text-chalk", opacity: 0.28, reverse: true },
  { top: "58%", size: 18, swim: "27s", delay: "-22s", bob: "3.5s", bobDelay: "-2.6s", color: "text-chalk", opacity: 0.3, reverse: false },
  { top: "68%", size: 34, swim: "48s", delay: "-40s", bob: "5s", bobDelay: "-1s", color: "text-chalk", opacity: 0.25, reverse: false },
  { top: "78%", size: 24, swim: "33s", delay: "-14s", bob: "4s", bobDelay: "-3s", color: "text-chalk", opacity: 0.22, reverse: true },
] as const;

/* Faces right. Body, dorsal, forked tail and anal fin are one outline;
   evenodd punches the eye. The pectoral fin overlaps the body, so it is a
   second path (group opacity on the <svg> keeps the overlap from doubling). */
function FishShape({
  size,
  color,
  opacity,
  flip,
}: {
  size: number;
  color: string;
  opacity: number;
  flip: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 16"
      width={size}
      height={size / 2}
      className={color}
      style={{ opacity, transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path
        fillRule="evenodd"
        d="M1 3.4 Q4.8 5.6 8 6 Q10 4.8 12.6 4.3 L13.2 4.2 Q14 1.5 17.6 1.1 Q18 3 16.9 4.3 Q22.5 4 27.5 5.9 Q30.4 7.1 31 8 Q28 10.6 23.5 11.5 Q20.5 12.1 18.4 12.2 L17.8 12.3 Q16.8 14.7 13.9 15 Q14.5 13.2 15.2 12.1 Q11 11.5 8 10 Q4.8 10.4 1 12.6 Q3.4 8 1 3.4 Z M28.6 7.2 a1 1 0 1 1 -2 0 a1 1 0 1 1 2 0 Z"
        fill="currentColor"
      />
      <path
        d="M20 9 Q19.2 12 16.6 13.2 Q19.6 12.9 22 10.2 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* Faces right. One continuous outline — tail lobes, dorsal, snout, jaw —
   with the eye and two gill slits punched out by evenodd; the swept-back
   pectoral fin is a second path for the same overlap reason as the fish. */
function SharkShape() {
  return (
    <svg
      viewBox="0 0 64 24"
      width={112}
      height={42}
      className="text-chalk"
      style={{ opacity: 0.28 }}
    >
      <path
        fillRule="evenodd"
        d="M2.5 3 Q7 6 12 8.8 Q18 7.2 26.5 6.6 L32 0.8 Q35.2 4.2 36 6.2 Q45 5.9 52 8 Q58.5 9.8 62.5 12.4 Q58.5 14.4 53.5 14.8 L52.2 13.9 L50.8 15.1 Q46 15.9 41.8 16.1 Q26 15.6 17 14.4 Q12.5 13.9 10.2 13.5 L1.8 18.8 Q4.8 14.8 5.1 12.1 Q4.9 8 2.5 3 Z M57.45 11.3 a0.95 0.95 0 1 1 -1.9 0 a0.95 0.95 0 1 1 1.9 0 Z M47.5 9.8 q1 2.4 0 4.8 l-0.8 0.1 q0.9 -2.5 0 -4.9 Z M45.4 9.9 q1 2.3 0 4.6 l-0.8 0.1 q0.9 -2.4 0 -4.7 Z"
        fill="currentColor"
      />
      <path
        d="M41.8 16.1 L32.5 22.6 Q36 19.5 37.6 15.9 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Shoal({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {FISH.map((f, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: f.top,
            left: "-6rem",
            animation: `fish-swim ${f.swim} linear ${f.delay} infinite${
              f.reverse ? " reverse" : ""
            }`,
          }}
        >
          <div
            style={{
              animation: `fish-bob ${f.bob} ease-in-out ${f.bobDelay} infinite alternate`,
            }}
          >
            <FishShape
              size={f.size}
              color={f.color}
              opacity={f.opacity}
              flip={f.reverse}
            />
          </div>
        </div>
      ))}
      {/* The very occasional shark — one 21s crossing per 140s cycle
          (shark-swim holds it off-screen the rest of the time). The -125s
          delay lands the first sighting ~15s after load. */}
      <div
        className="absolute"
        style={{
          top: "55%",
          left: "-9rem",
          animation: "shark-swim 140s linear -125s infinite",
        }}
      >
        <div style={{ animation: "fish-bob 7s ease-in-out infinite alternate" }}>
          <SharkShape />
        </div>
      </div>
      {/* The shark's catch — swims in from the right on the shark's own
          140s timeline (same delay), meets it about a third of the way
          across, and vanishes at the moment their paths cross. */}
      <div
        className="absolute"
        style={{
          top: "57%",
          right: "-3rem",
          animation: "fish-victim 140s linear -125s infinite",
        }}
      >
        <div
          style={{ animation: "fish-bob 3.6s ease-in-out -1s infinite alternate" }}
        >
          <FishShape size={22} color="text-chalk" opacity={0.3} flip />
        </div>
      </div>
    </div>
  );
}
