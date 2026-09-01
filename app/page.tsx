import { Button } from "@/components/Button";
import { ChartMotif } from "@/components/ChartMotif";
import { Shoal } from "@/components/Shoal";
import { Shore } from "@/components/Shore";

/**
 * Home — shell preview for Checkpoint A.
 * The split path below is the real §6 structure (teachers / employers fork);
 * the full home content (role cards, credibility block, TEFL nudge) lands in
 * build step 4.
 */
export default function Home() {
  return (
    <>
      <section className="relative flex flex-1 flex-col justify-center overflow-hidden">
        <ChartMotif className="text-channel opacity-[0.05]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <p className="kicker">Teacher recruitment</p>
          <h1 className="mt-4 max-w-[22ch] text-display">
            English teaching jobs in Taiwan and China
          </h1>
          <p className="mt-6 max-w-[52ch] text-lead text-flint">
            We place British and Commonwealth graduates into teaching jobs in
            Taiwan and mainland China — and help schools, colleges and
            companies find reliable instructors.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button href="/jobs">I&rsquo;m a teacher looking for work</Button>
            <Button href="/for-employers" variant="secondary">
              I&rsquo;m hiring teachers
            </Button>
          </div>
        </div>
      </section>
      <Shore />
      {/* Shallows deepening into the channel (sea-fade, globals.css), with
          the shoal cruising through; the fade lands on channel to meet the
          footer seamlessly. Retired placeholder copy, for when step 4 puts
          real content here: "Live roles, the credibility block and the TEFL
          nudge arrive in build step 4. This page currently exists to review
          the layout shell — header, footer, hero treatment and the split
          path above." Any future text: ink above the fade, chalk on the
          deep end. */}
      <section className="sea-fade relative h-80 overflow-hidden">
        <Shoal />
      </section>
    </>
  );
}
