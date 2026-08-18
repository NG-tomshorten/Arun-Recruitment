/**
 * WCAG AA contrast build gate (PLAN §11.1).
 * Reads the --color-* tokens straight out of app/globals.css and asserts the
 * pairs below, so a future palette tweak can't silently break contrast.
 * Runs as part of `npm run build`; exits non-zero on any failure.
 */
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

const colors = {};
for (const m of css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) {
  colors[m[1]] = m[2];
}

// [foreground, background, minimum ratio, context]
const PAIRS = [
  ["ink", "chalk", 4.5, "body text"],
  ["flint", "chalk", 4.5, "secondary text"],
  ["harbour-deep", "chalk", 4.5, "links on light"],
  ["harbour", "chalk", 4.5, "kickers, brand text"],
  ["rust", "chalk", 4.5, "form errors"],
  ["chalk", "harbour", 4.5, "primary button text"],
  ["chalk", "harbour-deep", 4.5, "pressed button text"],
  ["chalk", "channel", 4.5, "footer text, active chips"],
  ["channel", "foam", 4.5, "chip text"],
  ["ink", "beak", 4.5, "'New' badge text"],
  ["ink", "shingle", 4.5, "text on warm surface"],
  ["ink", "brand-teal", 4.5, "text on brand-teal fills"],
  ["ink", "shallows", 4.5, "text on shallows section wash"],
  ["channel", "brand-teal", 4.5, "text on brand-teal chips/pills"],
  ["beak-deep", "chalk", 3.0, "focus ring (non-text, WCAG 1.4.11)"],
];

function luminance(hex) {
  const c = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function ratio(fgHex, bgHex) {
  const [a, b] = [luminance(fgHex), luminance(bgHex)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

let failed = false;
for (const [fg, bg, min, context] of PAIRS) {
  if (!colors[fg] || !colors[bg]) {
    console.error(`✗ token missing: ${!colors[fg] ? fg : bg}`);
    failed = true;
    continue;
  }
  const r = ratio(colors[fg], colors[bg]);
  const ok = r >= min;
  if (!ok) failed = true;
  console.log(
    `${ok ? "✓" : "✗"} ${fg} on ${bg}  ${r.toFixed(2)}:1  (needs ${min}:1 — ${context})`,
  );
}

if (failed) {
  console.error("\nContrast check FAILED — adjust tokens in app/globals.css.");
  process.exit(1);
}
console.log("\nAll contrast pairs pass.");
