"use client";

// A link in Geist Sans, underlined with a hand-drawn marker line instead of a normal
// underline (design.md section 8). The words come from the Link in src/content/.
// A link that wraps gets its own line under each line of text: the lines are measured
// after it renders, and again whenever its size changes. Until then, a plain underline.

import { useLayoutEffect, useRef, useState } from "react";
import type { Link } from "@/content/types";
import { wobblyLine } from "@/lib/rough";

const external = (href: string) => /^https?:\/\//.test(href);

type Line = { x: number; y: number; width: number };

export function MarkerLink({ link }: { link: Link }) {
  const wrap = useRef<HTMLSpanElement>(null);
  const anchor = useRef<HTMLAnchorElement>(null);
  const [lines, setLines] = useState<Line[] | null>(null);

  useLayoutEffect(() => {
    const a = anchor.current;
    const w = wrap.current;
    if (!a || !w) return;
    const measure = () => {
      const box = w.getBoundingClientRect();
      const em = parseFloat(getComputedStyle(a).fontSize);
      setLines(
        Array.from(a.getClientRects()).map((r) => ({
          x: r.left - box.left,
          y: r.bottom - box.top - em * 0.42,
          width: r.width,
        })),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(w);
    return () => observer.disconnect();
  }, []);

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span ref={wrap} className="marker-link-wrap" data-measured={lines ? "" : undefined}>
        <a
          ref={anchor}
          href={link.href}
          className="marker-link font-sans text-ink"
          {...(external(link.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {link.label}
        </a>
        {lines ? (
          <svg className="marker-link__lines" aria-hidden>
            {lines.map((line, i) => (
              <svg key={i} x={line.x} y={line.y} width={line.width} height="0.45em" viewBox="0 0 100 10" preserveAspectRatio="none" overflow="visible">
                <path
                  d={wobblyLine(`${link.href}:${i}`, 100, 10, { wobble: 0.3, segments: 4 })}
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            ))}
          </svg>
        ) : null}
      </span>
      {link.tag ? <span className="font-mono text-mono">{link.tag}</span> : null}
    </span>
  );
}
