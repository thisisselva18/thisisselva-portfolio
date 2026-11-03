// A loud red burst behind a cutout (design.md sections 3 and 9), built from torn-paper rays
// like the sun behind the kid on the rocket: red paper with its own grain, a thin white torn
// rim showing round it. The one red shape on its screen. Square: give it a width and a place
// with className (e.g. "absolute -left-[15%] top-0 w-[130%]"), behind the cutout.

import { burstRays } from "@/lib/rough";

export function RedBurst({ seed, rays, className }: { seed: string; rays?: number; className?: string }) {
  const { burst, rim } = burstRays(seed, { rays });
  return (
    <span aria-hidden className={`pointer-events-none block aspect-square ${className ?? ""}`}>
      <span className="relative block size-full">
        <span className="absolute inset-0 bg-white" style={{ clipPath: rim }} />
        <span className="absolute inset-0" style={{ clipPath: burst }}>
          <span className="texture texture-red block size-full" />
        </span>
      </span>
    </span>
  );
}
