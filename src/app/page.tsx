// Scroll mode (Phase 4): the head, every timeline scene, then the end, as one plain scrolling
// page, all tied together by one red string. The landing, intro and story mode come later.

import { timeline } from "@/content/scenes";
import { HeadStage } from "@/components/head/HeadStage";
import { RedString } from "@/components/head/RedString";
import { Scene } from "@/components/journey/Scene";
import { TheEnd } from "@/components/journey/TheEnd";

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <div className="relative mx-auto max-w-[80rem] px-[var(--gutter-phone)] sm:px-10">
        <HeadStage />
        {timeline.map((scene) => (
          <Scene key={scene.id} scene={scene} />
        ))}
        <TheEnd />
        {/* One string from the kid's head through every cluster to the present-day head, behind the paper. */}
        <RedString layer="behind" />
      </div>
    </main>
  );
}
