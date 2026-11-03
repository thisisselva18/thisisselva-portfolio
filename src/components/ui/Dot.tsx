// The dot, the main character (design.md section 6): a small solid circle that is always
// alive, breathing slowly even when it's still. Ink on paper, or white on story-black.
// It holds still for prefers-reduced-motion (materials.css).

type Props = {
  tone?: "paper" | "dark"; // "dark" on --story-black: the dot is white and glows a little
  className?: string;
};

export function Dot({ tone = "paper", className }: Props) {
  return <span aria-hidden data-dot className={`dot ${tone === "dark" ? "dot--dark" : ""} ${className ?? ""}`} />;
}
