/**
 * The silhouettes for the home page's sea scene (components/Shoal.tsx) —
 * three fish and a reef shark, each drawn once as an SVG facing right.
 * Part of the scene's ambient-motion licence (CLAUDE.md, Conventions ›
 * Motion); decorative only, always inside an aria-hidden parent.
 *
 * Every creature is two or three paths: the body (eye and gill slits
 * punched out by evenodd), a pectoral fin that overlaps the body, and the
 * tail as its own path hinged at the peduncle. The tail's rotation is
 * `--beat` (a fast ±1 oscillation from the `tail-beat` keyframes, when a
 * `beat` period is given) times `--beat-amp` (the effort, 0–1, inherited
 * from the swimmer's path animation in globals.css) times the kind's
 * sweep. So a darting fish beats hard and a gliding one goes quiet, with
 * no JavaScript. Group opacity on the <g> keeps the fin overlap from
 * doubling.
 */

export type SeaLifeKind = "bream" | "mackerel" | "bass" | "reef-shark";

type Shape = {
  /** viewBox width and height — the drawing's aspect ratio */
  box: [number, number];
  body: string;
  fin?: string;
  tail: string;
  /** transform-origin inside the tail's own box: the peduncle */
  hinge: string;
  /** max tail rotation in degrees at full effort */
  sweep: number;
};

const SHAPES: Record<SeaLifeKind, Shape> = {
  // Deep-bodied, forked tail — the reef's resident
  bream: {
    box: [32, 16],
    body: "M8 6 Q10 4.8 12.6 4.3 L13.2 4.2 Q14 1.5 17.6 1.1 Q18 3 16.9 4.3 Q22.5 4 27.5 5.9 Q30.4 7.1 31 8 Q28 10.6 23.5 11.5 Q20.5 12.1 18.4 12.2 L17.8 12.3 Q16.8 14.7 13.9 15 Q14.5 13.2 15.2 12.1 Q11 11.5 8 10 Q7.3 8 8 6 Z M28.6 7.2 a1 1 0 1 1 -2 0 a1 1 0 1 1 2 0 Z",
    fin: "M20 9 Q19.2 12 16.6 13.2 Q19.6 12.9 22 10.2 Z",
    tail: "M9 6.1 Q4.8 5.6 1 3.4 Q3.4 8 1 12.6 Q4.8 10.4 9 9.9 Z",
    hinge: "100% 50%",
    sweep: 16,
  },
  // Slim torpedo with two small dorsals and a deep fork — the fast one,
  // and the one the schools are made of
  mackerel: {
    box: [40, 12],
    body: "M9 5.1 C13 3.9 16 3.4 19 3.3 L20.2 1.4 L23.6 3.2 C26 3.2 28.5 3.4 30 3.8 L30.6 2.6 L32.4 4.1 C35 4.6 38 5.4 39.5 6 C38 6.9 35 7.7 32.5 8 L31 9.4 L29.5 8.3 C26 8.6 23 8.7 21 8.6 L20 10.1 L18.6 8.5 C15 8.3 12 7.9 9 6.9 Q8.4 6 9 5.1 Z M35.85 5.6 a0.75 0.75 0 1 0 1.5 0 a0.75 0.75 0 1 0 -1.5 0 Z",
    fin: "M30 6.6 Q28.6 8.4 26.4 9 Q28.8 9.2 31.2 7.4 Z",
    tail: "M9.8 5.3 Q5.5 3.6 1 1.2 Q3.2 6 1 10.8 Q5.5 8.4 9.8 6.7 Z",
    hinge: "100% 50%",
    sweep: 18,
  },
  // Spiny dorsal and a fan tail — a sea bass
  bass: {
    box: [36, 18],
    body: "M8 6.8 C10 5.6 12 4.6 13.5 4.2 L14.4 1.9 L15.6 3.8 L16.8 1.6 L18 3.6 L19.2 1.8 L20.4 3.6 L21.6 2.2 L22.6 3.8 Q24.5 3 26.5 4.4 C29.5 5.2 33 7 35 9 C33 10.4 30 11.6 27.5 12.2 L26.4 14 L25 12.6 C22 13.4 19 13.6 17 13.5 L16.2 15.4 L14.6 13.3 C12 12.9 9.8 12.2 8 11.2 Q7.3 9 8 6.8 Z M30.65 8 a0.95 0.95 0 1 0 1.9 0 a0.95 0.95 0 1 0 -1.9 0 Z",
    fin: "M27 10 Q25.6 12.4 23 13.4 Q26 13.4 28.6 11 Z",
    tail: "M8.8 7 Q4.5 5.4 1.2 4 Q2.6 9 1.2 14 Q4.5 12.6 8.8 11 Z",
    hinge: "100% 50%",
    sweep: 14,
  },
  // Slender, heterocercal tail, two gill slits
  "reef-shark": {
    box: [64, 24],
    body: "M12 8.8 Q18 7.2 26.5 6.6 L32 0.8 Q35.2 4.2 36 6.2 Q45 5.9 52 8 Q58.5 9.8 62.5 12.4 Q58.5 14.4 53.5 14.8 L52.2 13.9 L50.8 15.1 Q46 15.9 41.8 16.1 Q26 15.6 17 14.4 Q12.5 13.9 10.2 13.5 Q11.4 11.2 12 8.8 Z M57.45 11.3 a0.95 0.95 0 1 1 -1.9 0 a0.95 0.95 0 1 1 1.9 0 Z M47.5 9.8 q1 2.4 0 4.8 l-0.8 0.1 q0.9 -2.5 0 -4.9 Z M45.4 9.9 q1 2.3 0 4.6 l-0.8 0.1 q0.9 -2.4 0 -4.7 Z",
    fin: "M41.8 16.1 L32.5 22.6 Q36 19.5 37.6 15.9 Z",
    tail: "M13 9 Q7 6.2 2.5 3 Q4.9 8 5.1 12.1 Q4.8 14.8 1.8 18.8 L10.2 13.5 L13 13.6 Z",
    hinge: "100% 50%",
    sweep: 9,
  },
};

export function SeaLife({
  kind,
  size,
  className,
  opacity,
  beat,
}: {
  kind: SeaLifeKind;
  /** rendered width in px; height follows the drawing's aspect */
  size: number;
  /** the silhouette colour — a text-* token class */
  className: string;
  opacity: number;
  /** tail half-period, e.g. "0.3s"; omit for a still tail */
  beat?: string;
}) {
  const shape = SHAPES[kind];
  const [w, h] = shape.box;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={(size * h) / w}
      className={`block ${className}`}
    >
      <g fill="currentColor" style={{ opacity }}>
        <path fillRule="evenodd" d={shape.body} />
        {shape.fin && <path d={shape.fin} />}
        <path
          d={shape.tail}
          style={{
            transformBox: "fill-box",
            transformOrigin: shape.hinge,
            transform: `rotate(calc(var(--beat) * var(--beat-amp) * ${shape.sweep}deg))`,
            animation: beat
              ? `tail-beat ${beat} ease-in-out infinite alternate`
              : undefined,
          }}
        />
      </g>
    </svg>
  );
}
