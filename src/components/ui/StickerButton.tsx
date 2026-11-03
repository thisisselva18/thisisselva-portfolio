// A sticker-style button (design.md section 8): solid red with a white sticker border,
// ink text in bold Geist Sans caps, at least 19px. On hover it lifts and tilts a little,
// like a sticker being peeled. A link when given href, otherwise a button.
// Ink on red is 4.1:1, which passes only because the text is bold and at least 19px.

import type { CSSProperties, MouseEventHandler } from "react";
import { random, tilt } from "@/lib/rough";

type Props = {
  label: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export function StickerButton({ label, href, onClick, className }: Props) {
  const r = random(`button:${label}`);
  const corner = () => `${(0.7 + r() * 0.6).toFixed(2)}rem`;
  const style = {
    rotate: `${tilt(`button:${label}`, 2)}deg`,
    borderRadius: `${corner()} ${corner()} ${corner()} ${corner()}`,
    "--peel": `${r() < 0.5 ? -2.5 : 2.5}deg`,
  } as CSSProperties;
  const classes = `sticker-button inline-block border-4 border-white bg-red px-6 py-2.5 font-sans text-button font-bold uppercase tracking-wide text-ink shadow-lift ${className ?? ""}`;

  if (href) {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className={classes}
        style={style}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes} style={style}>
      {label}
    </button>
  );
}
