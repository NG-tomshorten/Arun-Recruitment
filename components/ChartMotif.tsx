/**
 * Abstract nautical-chart drawing of the Arun mouth (PLAN §11.3):
 * the river's meander, depth-sounding marks, a compass-rose fragment.
 * Rendered at 4–6% opacity on chalk, slightly higher on channel.
 * Decorative only — never behind body text. Colour/opacity come from className,
 * e.g. `text-channel opacity-[0.05]` or `text-chalk opacity-[0.07]`.
 */
export function ChartMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 640"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
    >
      {/* The Arun's meander — two banks, flaring into the estuary mouth */}
      <path
        d="M168 -20 C 140 70, 236 128, 214 208 C 192 288, 296 320, 326 392 C 356 464, 296 512, 338 566 C 366 602, 420 622, 464 640"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M196 -20 C 172 66, 262 124, 242 200 C 222 280, 322 312, 352 384 C 382 456, 330 504, 372 556 C 402 594, 470 616, 530 634"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Fathom contours off the mouth */}
      <path
        d="M260 610 Q 600 508 940 606"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="3 8"
      />
      <path
        d="M330 646 Q 620 566 910 648"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="3 8"
      />
      {/* Depth soundings */}
      <g
        fill="currentColor"
        stroke="none"
        fontSize="13"
        fontFamily="var(--font-inter), sans-serif"
      >
        <text x="560" y="470">5</text>
        <text x="680" y="520">3</text>
        <text x="790" y="460">7</text>
        <text x="880" y="540">9</text>
        <text x="470" y="540">4</text>
        <text x="640" y="590">2</text>
        <text x="990" y="500">12</text>
        <text x="740" y="610">6</text>
      </g>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M610 508 h8 M614 504 v8" />
        <path d="M842 492 h8 M846 488 v8" />
        <path d="M528 590 h8 M532 586 v8" />
      </g>
      {/* Compass-rose fragment, clipped by the top-right corner */}
      <g stroke="currentColor" strokeWidth="1.2">
        <circle cx="1085" cy="95" r="82" />
        <circle cx="1085" cy="95" r="94" strokeDasharray="2 6" />
        <path d="M1085 13 V -20 M1085 177 V 210 M1003 95 H 970 M1167 95 H 1200" />
        <path d="M1085 95 L 1070 140 L 1085 128 L 1100 140 Z" fill="currentColor" stroke="none" opacity="0.7" />
        <path d="M1085 95 L 1078 42 L 1085 52 L 1092 42 Z" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
