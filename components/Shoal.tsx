import { SeaLife, type SeaLifeKind } from "@/components/SeaLife";

/**
 * The shoal — life in the sea-fade section on the home page. Realism
 * pass, 7 Sep 2026 (Tom), trimmed back the same week: a few fish of each size,
 * one school, and a reef shark every couple of minutes that lunges at a
 * small group and takes one.
 *
 * All CSS: every creature is a wrapper running one of the path keyframes
 * in globals.css (fish-dart / fish-wander / fish-patrol / shark-hunt), a
 * bob wrapper for the small drift, and a SeaLife silhouette whose tail
 * beats in step with the path's effort. Depth is read from the section:
 * fish near the surface are dark (channel) against the bright shallows,
 * fish at depth are pale (chalk) against the channel. Mirrored creatures
 * swim right-to-left by rendering inside a scaleX(-1) box, so one set of
 * keyframes serves both directions. Varied cycles and negative delays make
 * the traffic read as random while staying deterministic; the
 * reduced-motion rule in globals.css stills the lot (crossings end
 * off-screen, patrols remain).
 * Decorative only — always aria-hidden, never interactive.
 */

type BurstPath = "fish-dart" | "fish-wander" | "fish-patrol";

type Swimmer = {
  kind: Extract<SeaLifeKind, "bream" | "mackerel" | "bass">;
  /** depth, as % of the section */
  top: string;
  /** start x — "-8rem" for a crossing, a % for a patrol */
  left: string;
  /** rendered width in px */
  size: number;
  path: BurstPath;
  cycle: string;
  delay: string;
  /** tail half-period */
  beat: string;
  bob: string;
  bobDelay: string;
  color: "text-channel" | "text-chalk";
  opacity: number;
  mirror?: boolean;
};

// Deep water first, so nearer fish paint over farther ones
const SWIMMERS: Swimmer[] = [
  { kind: "bass", top: "66%", left: "28%", size: 58, path: "fish-patrol", cycle: "76s", delay: "-52s", beat: "0.34s", bob: "5.2s", bobDelay: "-3.3s", color: "text-chalk", opacity: 0.22 },
  { kind: "mackerel", top: "84%", left: "-8rem", size: 24, path: "fish-wander", cycle: "48s", delay: "-30s", beat: "0.2s", bob: "3.3s", bobDelay: "-1.4s", color: "text-chalk", opacity: 0.2, mirror: true },
  { kind: "mackerel", top: "76%", left: "-8rem", size: 42, path: "fish-dart", cycle: "42s", delay: "-18s", beat: "0.24s", bob: "3.8s", bobDelay: "-2.4s", color: "text-chalk", opacity: 0.22 },
  { kind: "bream", top: "60%", left: "64%", size: 30, path: "fish-patrol", cycle: "44s", delay: "-9s", beat: "0.22s", bob: "3.7s", bobDelay: "-0.8s", color: "text-chalk", opacity: 0.24, mirror: true },
  { kind: "mackerel", top: "45%", left: "-8rem", size: 26, path: "fish-dart", cycle: "28s", delay: "-4s", beat: "0.18s", bob: "3.1s", bobDelay: "-2s", color: "text-channel", opacity: 0.26 },
  { kind: "mackerel", top: "40%", left: "-8rem", size: 44, path: "fish-dart", cycle: "31s", delay: "-12s", beat: "0.2s", bob: "3.4s", bobDelay: "-0.6s", color: "text-channel", opacity: 0.3, mirror: true },
  { kind: "bream", top: "32%", left: "9%", size: 66, path: "fish-patrol", cycle: "54s", delay: "-14s", beat: "0.3s", bob: "4.4s", bobDelay: "0s", color: "text-channel", opacity: 0.36 },
  { kind: "mackerel", top: "24%", left: "-8rem", size: 40, path: "fish-dart", cycle: "35s", delay: "-22s", beat: "0.22s", bob: "3.6s", bobDelay: "-2.2s", color: "text-channel", opacity: 0.36, mirror: true },
  { kind: "mackerel", top: "5%", left: "-8rem", size: 22, path: "fish-dart", cycle: "26s", delay: "-15s", beat: "0.18s", bob: "2.9s", bobDelay: "-0.3s", color: "text-channel", opacity: 0.38, mirror: true },
];

// One school of small mackerel near the surface that moves as one and
// turns together; each member wobbles a little in its place
const SCHOOL = {
  top: "12%",
  cycle: "50s",
  delay: "-21s",
  size: 26,
  opacity: 0.4,
  /** the formation's box, so a turn flips it about its own centre */
  box: [96, 36],
  members: [
    { x: 0, y: 9, jitter: "2.1s", delay: "-0.5s" },
    { x: 22, y: 0, jitter: "1.8s", delay: "-1.3s" },
    { x: 24, y: 19, jitter: "2.4s", delay: "-0.1s" },
    { x: 46, y: 5, jitter: "1.9s", delay: "-1.7s" },
    { x: 50, y: 23, jitter: "2.2s", delay: "-0.9s" },
  ],
} as const;

// The reef shark: one crossing per 150s cycle, the first ~10s after load
const SHARK = { top: "52%", size: 160, cycle: "150s", delay: "-140s", beat: "0.95s", bob: "7s", opacity: 0.3 } as const;

/* Where the shark's nose is at shark-hunt's 6% keyframe: the wrapper's
   -14rem start plus 37.5vw of travel plus the 160px (10rem) silhouette */
const HUNT_SCHOOL_LEFT = "calc(37.5vw - 4rem)";
const HUNT_SCHOOL = [
  { path: "fish-scatter-up", top: "50%", dx: 0, bob: "3.1s", bobDelay: "-0.7s" },
  { path: "fish-scatter-down", top: "53.5%", dx: 16, bob: "3.5s", bobDelay: "-1.9s" },
  { path: "fish-scatter-taken", top: "51.5%", dx: 34, bob: "3.3s", bobDelay: "-1.2s" },
] as const;

/* Swim the other way: the same keyframes inside a mirrored box */
function Mirror({ on, children }: { on?: boolean; children: React.ReactNode }) {
  if (!on) return children;
  return (
    <div className="absolute inset-0" style={{ transform: "scaleX(-1)" }}>
      {children}
    </div>
  );
}

export function Shoal({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {SWIMMERS.map((f, i) => (
        <Mirror key={i} on={f.mirror}>
          <div
            className="absolute"
            style={{
              top: f.top,
              left: f.left,
              animation: `${f.path} ${f.cycle} linear ${f.delay} infinite`,
            }}
          >
            <div style={{ animation: `fish-bob ${f.bob} ease-in-out ${f.bobDelay} infinite alternate` }}>
              <SeaLife kind={f.kind} size={f.size} className={f.color} opacity={f.opacity} beat={f.beat} />
            </div>
          </div>
        </Mirror>
      ))}

      <div
        className="absolute"
        style={{
          top: SCHOOL.top,
          left: "-8rem",
          width: SCHOOL.box[0],
          height: SCHOOL.box[1],
          animation: `fish-wander ${SCHOOL.cycle} linear ${SCHOOL.delay} infinite`,
        }}
      >
        {SCHOOL.members.map((m, j) => (
          <div
            key={j}
            className="absolute"
            style={{
              left: m.x,
              top: m.y,
              animation: `school-jitter ${m.jitter} ease-in-out ${m.delay} infinite alternate`,
            }}
          >
            <SeaLife kind="mackerel" size={SCHOOL.size} className="text-channel" opacity={SCHOOL.opacity} />
          </div>
        ))}
      </div>

      <div
        className="absolute"
        style={{
          top: SHARK.top,
          left: "-14rem",
          animation: `shark-hunt ${SHARK.cycle} linear ${SHARK.delay} infinite`,
        }}
      >
        <div style={{ animation: `fish-bob ${SHARK.bob} ease-in-out infinite alternate` }}>
          <SeaLife kind="reef-shark" size={SHARK.size} className="text-chalk" opacity={SHARK.opacity} beat={SHARK.beat} />
        </div>
      </div>

      {/* The three in the shark's path — they scatter as it lunges, and
          the last one is taken (fish-scatter-*, on the shark's clock) */}
      {HUNT_SCHOOL.map((m, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: m.top,
            left: `calc(${HUNT_SCHOOL_LEFT} + ${m.dx}px)`,
            animation: `${m.path} ${SHARK.cycle} linear ${SHARK.delay} infinite`,
          }}
        >
          <div style={{ animation: `fish-bob ${m.bob} ease-in-out ${m.bobDelay} infinite alternate` }}>
            <SeaLife kind="mackerel" size={28} className="text-chalk" opacity={0.28} />
          </div>
        </div>
      ))}
    </div>
  );
}
