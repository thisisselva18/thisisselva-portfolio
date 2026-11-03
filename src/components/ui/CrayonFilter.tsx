// A waxy, broken crayon edge for an SVG stroke: roughened, then speckled where the wax
// skipped over the paper's grain. Drawn once, never animated. Put it in the <svg>'s
// <defs> and point the stroke at it with filter="url(#id)".

export function CrayonFilter({ id, rough = 2.5 }: { id: string; rough?: number }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale={rough} result="rough" />
      <feComponentTransfer in="noise" result="speckle">
        <feFuncA type="discrete" tableValues="0 1 1 1 1" />
      </feComponentTransfer>
      <feComposite in="rough" in2="speckle" operator="in" />
    </filter>
  );
}
