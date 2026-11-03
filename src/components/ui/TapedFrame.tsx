// A frame taped to the page: a polaroid for thumbnails and the YouTube embed,
// or a phone for vertical reels (design.md section 8). Whatever goes inside is
// passed in as children; the frame adds no words of its own.

import type { ReactNode } from "react";
import { tilt } from "@/lib/rough";
import { Tape, type TapeAt } from "./Tape";

type Props = {
  seed: string;
  variant?: "polaroid" | "phone";
  tapes?: TapeAt[];
  children: ReactNode;
  footer?: ReactNode; // sits on the polaroid's wide bottom edge, or below the phone
  className?: string;
};

export function TapedFrame({ seed, variant = "polaroid", tapes = ["top"], children, footer, className }: Props) {
  const angle = tilt(`frame:${seed}`, 3);
  if (variant === "phone") {
    return (
      <figure className={`relative m-0 ${className ?? ""}`} style={{ rotate: `${angle}deg` }}>
        <div className="overflow-hidden rounded-[1.75rem] border-[0.55rem] border-ink bg-ink shadow-lift">
          <div className="overflow-hidden rounded-[1.2rem]">{children}</div>
        </div>
        {tapes.map((at) => (
          <Tape key={at} at={at} seed={seed} />
        ))}
        {footer}
      </figure>
    );
  }
  return (
    <figure
      className={`texture texture-mount relative m-0 px-3 pb-12 pt-3 shadow-lift ${className ?? ""}`}
      style={{ rotate: `${angle}deg` }}
    >
      <div className="relative">{children}</div>
      {tapes.map((at) => (
        <Tape key={at} at={at} seed={seed} />
      ))}
      {footer}
    </figure>
  );
}
