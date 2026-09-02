import { Button } from "@/components/Button";
import { ChartMotif } from "@/components/ChartMotif";
import { Shoal } from "@/components/Shoal";
import { Shore } from "@/components/Shore";

/**
 * Home — deliberately minimal (Barry's preference, 2 Sep 2026, reverting to
 * the Checkpoint-A shape): the teacher/employer fork over the sea scene and
 * nothing else. Placements, the who-we-are copy and everything else live on
 * their own pages behind the nav. This page fetches no content, so it can
 * never break when the listings change.
 */
export default function Home() {
  return (
    <>
      <section className="relative flex flex-1 flex-col justify-center overflow-hidden">
        <ChartMotif className="text-channel opacity-[0.05]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <p className="kicker">Teacher recruitment</p>
          <h1 className="mt-4 max-w-[22ch] text-display">
            We place English teachers in Taiwan and China
          </h1>
          <p className="mt-6 max-w-[52ch] text-lead text-flint">
            We find teaching posts for British and Commonwealth graduates,
            and reliable instructors for the schools, colleges and companies
            that need them.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button href="/contact">I&rsquo;m a teacher looking for work</Button>
            <Button href="/for-employers" variant="secondary">
              I&rsquo;m hiring teachers
            </Button>
          </div>
        </div>
      </section>
      <Shore />
      {/* Shallows deepening into the channel (sea-fade, globals.css), with
          the shoal cruising through; the fade lands on channel to meet the
          footer seamlessly. Any future text: ink above the fade, chalk on
          the deep end. */}
      <section className="sea-fade relative h-80 overflow-hidden">
        <Shoal />
      </section>
    </>
  );
}
