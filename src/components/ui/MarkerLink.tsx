// A link in Geist Sans, underlined with a hand-drawn marker line instead of a normal
// underline (design.md section 8). The words come from the Link in src/content/.

import type { Link } from "@/content/types";
import { wobblyLine } from "@/lib/rough";

const external = (href: string) => /^https?:\/\//.test(href);

export function MarkerLink({ link }: { link: Link }) {
  const line = wobblyLine(link.href, 100, 10, { wobble: 0.3, segments: 4 });
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <a
        href={link.href}
        className="marker-link font-sans text-ink"
        {...(external(link.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {link.label}
        <svg className="marker-link__line" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden>
          <path
            d={line}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="2.4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </a>
      {link.tag ? <span className="font-mono text-mono">{link.tag}</span> : null}
    </span>
  );
}
