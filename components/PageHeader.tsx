import type { ReactNode } from "react";
import { ChartMotif } from "./ChartMotif";
import { TideLine } from "./TideLine";

/**
 * The inner-page hero band (taste pass, 6 Sep 2026): kicker, h1, tide line
 * and lead over the chart motif, so /jobs, /for-employers, /contact and
 * /profile share the home page's atmosphere instead of opening on flat
 * chalk. The motif sits at 3.5% here — quieter than the home hero's 5%,
 * and only ever behind the heading block (PLAN §11.3: never behind body
 * text). Page bodies follow in their own container.
 */
export function PageHeader({
  kicker,
  title,
  lead,
  children,
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <ChartMotif className="text-channel opacity-[0.035]" />
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pb-12 sm:pt-20">
        <p className="kicker">{kicker}</p>
        <h1 className="mt-4 max-w-[24ch] text-h1">{title}</h1>
        <TideLine className="mt-4 max-w-40" />
        {lead && (
          <p className="mt-6 max-w-[62ch] text-lead text-flint">{lead}</p>
        )}
        {children}
      </div>
    </section>
  );
}
