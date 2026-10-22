"use client";

/**
 * Ambient background — the site's signature backdrop.
 *
 * Layered, all decorative (`aria-hidden`, `pointer-events-none`), and cheap:
 *  1. A masked engineering grid + a finer dot lattice (pure CSS, no runtime).
 *  2. An SVG "circuit" of broken/dashed lines with a slow dash-flow animation —
 *     the motif that gives the page its technical, blueprint character.
 *  3. Programming glyphs: 0/1 binary runs and code tokens, scattered toward the
 *     edges so they frame the content instead of sitting behind it.
 *  4. Two soft aurora blobs (CSS keyframes) for colour depth.
 *  5. A vignette that sinks the edges so foreground content always reads.
 *
 * Contrast rule: every glyph layer is deliberately faint (opacity well under
 * 0.2) and the vignette + content scrim sit on top, so background texture never
 * competes with the copy. All loops are frozen under `prefers-reduced-motion`
 * and on small screens (see layout.css) — mobile pays no animation cost.
 */

/** Hand-authored schematic paths (viewBox 1440×900, sliced to cover). */
const BROKEN_LINES: { d: string; tone: "accent" | "muted" | "violet"; dash: boolean }[] = [
  { d: "M -60 140 H 300 L 400 240 H 690 L 770 160 H 1120 L 1220 260 H 1500", tone: "accent", dash: true },
  { d: "M 1500 70 H 1180 L 1080 170 H 840 L 760 90", tone: "muted", dash: true },
  { d: "M -60 660 H 250 L 350 560 H 640 L 720 640 H 1000 L 1080 560 H 1500", tone: "accent", dash: true },
  { d: "M 1500 800 H 1220 L 1120 700 H 900 L 820 780 H 560", tone: "violet", dash: true },
  { d: "M 200 -60 V 210 L 300 310 V 520 L 200 620 V 960", tone: "muted", dash: true },
  { d: "M 1260 -60 V 250 L 1160 350 V 640 L 1260 740 V 960", tone: "accent", dash: true },
  { d: "M 760 960 V 740 L 860 640 V 420", tone: "violet", dash: true },
  { d: "M 520 -60 V 150 L 620 250 V 430 L 520 530", tone: "muted", dash: false },
];

/** Junction nodes that sit on the schematic corners. */
const NODES: { cx: number; cy: number }[] = [
  { cx: 300, cy: 140 },
  { cx: 690, cy: 240 },
  { cx: 1120, cy: 160 },
  { cx: 250, cy: 660 },
  { cx: 1000, cy: 640 },
  { cx: 1120, cy: 700 },
  { cx: 300, cy: 310 },
  { cx: 1160, cy: 350 },
  { cx: 620, cy: 250 },
];

/**
 * Vertical runs of 0/1, stacked like a hex dump. Kept to the outer thirds of
 * the canvas (x < 260 or x > 1180) so they frame the copy rather than sit
 * behind it.
 */
const BINARY_COLUMNS: {
  x: number;
  y: number;
  bits: string;
  tone: "accent" | "faint" | "violet";
}[] = [
  { x: 78, y: 96, bits: "01001", tone: "accent" },
  { x: 150, y: 190, bits: "10110", tone: "faint" },
  { x: 78, y: 470, bits: "11001", tone: "violet" },
  { x: 208, y: 690, bits: "00110", tone: "faint" },
  { x: 250, y: 820, bits: "101", tone: "accent" },
  { x: 1330, y: 120, bits: "10011", tone: "faint" },
  { x: 1400, y: 250, bits: "0110", tone: "accent" },
  { x: 1340, y: 520, bits: "11010", tone: "violet" },
  { x: 1404, y: 640, bits: "0011", tone: "faint" },
  { x: 1250, y: 800, bits: "10110", tone: "accent" },
];

/** A handful of code tokens for a "source file" flavour. */
const CODE_TOKENS: {
  x: number;
  y: number;
  text: string;
  tone: "accent" | "faint" | "violet";
  size: number;
}[] = [
  { x: 60, y: 330, text: "{ }", tone: "accent", size: 26 },
  { x: 1360, y: 400, text: "</>", tone: "accent", size: 24 },
  { x: 170, y: 620, text: "=>", tone: "violet", size: 22 },
  { x: 1230, y: 700, text: "::", tone: "faint", size: 22 },
  { x: 690, y: 60, text: "0x1F", tone: "faint", size: 18 },
  { x: 980, y: 860, text: "const", tone: "faint", size: 18 },
];

const TONE_CLASS: Record<string, string> = {
  accent: "bg-broken-lines",
  muted: "bg-broken-lines bg-broken-lines--muted",
  violet: "bg-broken-lines bg-broken-lines--violet",
};

/** Fill + opacity for the glyph layers, kept deliberately low-contrast. */
const GLYPH_TONE: Record<string, { fill: string; opacity: number }> = {
  accent: { fill: "var(--accent)", opacity: 0.22 },
  violet: { fill: "var(--accent-2)", opacity: 0.2 },
  faint: { fill: "var(--text-faint)", opacity: 0.3 },
};

export function AmbientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={
        className ??
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg"
      }
    >
      {/* Grid + dot lattice */}
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-dots" />

      {/* Programming glyphs: binary runs + code tokens (drift slowly). */}
      <svg
        className="bg-code absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {BINARY_COLUMNS.map((col, i) => {
          const tone = GLYPH_TONE[col.tone];
          return (
            <text
              key={`bin-${i}`}
              className="font-mono"
              x={col.x}
              y={col.y}
              fontSize={13}
              letterSpacing={1}
              fill={tone.fill}
              opacity={tone.opacity}
            >
              {col.bits.split("").map((bit, j) => (
                <tspan key={j} x={col.x} dy={j === 0 ? 0 : 15}>
                  {bit}
                </tspan>
              ))}
            </text>
          );
        })}

        {CODE_TOKENS.map((token, i) => {
          const tone = GLYPH_TONE[token.tone];
          return (
            <text
              key={`tok-${i}`}
              className="font-mono"
              x={token.x}
              y={token.y}
              fontSize={token.size}
              fill={tone.fill}
              opacity={tone.opacity}
            >
              {token.text}
            </text>
          );
        })}
      </svg>

      {/* Broken / dashed circuit lines */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.55]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {BROKEN_LINES.map((line, i) => (
          <path
            key={i}
            d={line.d}
            className={`${TONE_CLASS[line.tone]} ${line.dash ? "bg-broken-lines__dash" : ""}`}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animationDelay: `${i * -2.6}s` }}
          />
        ))}
        {NODES.map((node, i) => (
          <circle
            key={i}
            cx={node.cx}
            cy={node.cy}
            r={2.5}
            className="fill-accent opacity-70"
          />
        ))}
      </svg>

      {/* Aurora depth (cyan + violet) */}
      <div className="aurora-blob absolute -left-1/4 top-1/5 h-[38vmax] w-[38vmax] rounded-full bg-accent-soft blur-[130px] [animation:aurora-shift_20s_ease-in-out_infinite]" />
      <div className="aurora-blob absolute -right-1/4 bottom-0 h-[34vmax] w-[34vmax] rounded-full bg-accent-2-soft blur-[130px] [animation:aurora-shift_26s_ease-in-out_infinite_reverse]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,transparent_30%,var(--bg)_100%)] opacity-80" />
    </div>
  );
}

export default AmbientBackground;
