// Scroll mode: the head, every timeline scene, then the end, as one scrolling page, all tied
// together by one red string (Phase 4), with the motion on top (Phase 5: JourneyMotion, the
// year bar, the string growing with the scroll). The landing, intro and story mode come later.

import { timeline } from "@/content/scenes";
import { HeadStage } from "@/components/head/HeadStage";
import { RedString } from "@/components/head/RedString";
import { Scene } from "@/components/journey/Scene";
import { JourneyMotion } from "@/components/journey/JourneyMotion";
import { TheEnd } from "@/components/journey/TheEnd";
import { YearBar } from "@/components/journey/YearBar";

export default function Home() {
  return (
    <main data-journey className="overflow-x-clip">
      <div className="relative mx-auto max-w-[80rem] px-[var(--gutter-phone)] sm:px-10">
        <HeadStage />
        {timeline.map((scene) => (
          <Scene key={scene.id} scene={scene} />
        ))}
        <TheEnd />
        {/* One string from the kid's head through every cluster to the present-day head, behind the paper. */}
        <RedString layer="behind" grow />
      </div>
      <YearBar />
      <JourneyMotion />
    </main>
  );
}
