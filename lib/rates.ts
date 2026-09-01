/**
 * Approximate GBP conversion rates — units of foreign currency per £1.
 * Refreshed manually about twice a year (see docs/MAINTENANCE.md).
 * TODO: verify against live mid-market rates at cutover (values set Aug 2026).
 *
 * GBP figures are computed at build time and always displayed as "approx. £…".
 * JSON-LD always emits the original currency, never the conversion (PLAN §5).
 */
export const GBP_RATES = {
  RMB: 9.3,
  TWD: 40,
} as const;

export type SalaryCurrency = keyof typeof GBP_RATES;

/** Convert to GBP — rounded to the nearest £10, except small amounts
 *  (hourly rates) which keep £1 precision or the range would collapse. */
export function approxGBP(amount: number, currency: SalaryCurrency): number {
  const gbp = amount / GBP_RATES[currency];
  if (gbp < 100) return Math.round(gbp);
  return Math.round(gbp / 10) * 10;
}

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

/** "approx. £1,830–£2,470" (single figure if min === max or max is absent). */
export function approxGBPRange(
  min: number,
  max: number | undefined,
  currency: SalaryCurrency,
): string {
  const lo = approxGBP(min, currency);
  const hi = max == null ? lo : approxGBP(max, currency);
  // Single figure when the two ends round to the same amount ("£20–£20").
  if (hi === lo) return `approx. ${gbp.format(lo)}`;
  return `approx. ${gbp.format(lo)}–${gbp.format(hi)}`;
}
