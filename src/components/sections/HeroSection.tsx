"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { localized } from "@/i18n/format";
import { cn, scrollToSection } from "@/lib/utils";
import type { Content } from "@/types";

interface HeroSectionProps {
  content: Content;
  locale: Locale;
  labels: Dictionary["hero"];
  /** Names of the top skills, used as the `stack` array in the code artifact. */
  stack?: string[];
  className?: string;
}

/**
 * Hero chapter — split layout.
 *
 * Left: static, fully legible copy (deliberately no text animation). Right: a
 * crafted "source file" artifact — a glass editor window with a pointer-driven
 * 3D tilt and two parallax depth planes behind it.
 *
 * Why not WebGL here: the previous Three.js object was replaced because a
 * rendered code window is *sharper* (real font rasterisation, real syntax
 * colours), costs no GPU work and no ~600 kB client chunk, and still reads as
 * genuinely dimensional thanks to `perspective` + `translateZ` layering. The
 * whole artifact is DOM, so it is fully responsive and never blocks the copy.
 */
export function HeroSection({
  content,
  locale,
  labels,
  stack,
  className,
}: HeroSectionProps) {
  const title = localized(locale, content.heroTitle, content.heroTitleFa);
  const subtitle = localized(
    locale,
    content.heroSubtitle,
    content.heroSubtitleFa,
  );
  const description = localized(
    locale,
    content.heroDescription,
    content.heroDescriptionFa,
  );

  return (
    <section
      id="home"
      className={cn("relative flex min-h-full items-center", className)}
    >
      <div className="chapter-shell grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
        {/* Copy */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface/50 px-4 py-1.5 font-mono text-xs tracking-[var(--ls-eyebrow)] text-accent backdrop-blur-sm">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent"
              aria-hidden="true"
            />
            {labels.greeting}
          </span>

          <h1
            className="text-safe font-bold tracking-[var(--ls-display)] text-text"
            style={{ fontSize: "var(--fs-5)", lineHeight: "var(--lh-display)" }}
          >
            {title}{" "}
            <span
              className="text-safe block font-semibold text-text-muted"
              style={{ fontSize: "var(--fs-2)", lineHeight: "var(--lh-title)" }}
            >
              {subtitle}
            </span>
          </h1>

          <p
            className="text-safe max-w-xl leading-relaxed text-text-muted"
            style={{ fontSize: "var(--fs-0)" }}
          >
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => scrollToSection("contact")}
              className={cn(
                "group inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-3.5",
                "font-mono text-sm font-semibold tracking-[var(--ls-button)] text-bg",
                "transition-[transform,filter] duration-200 ease-out hover:brightness-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                "active:scale-[0.97]",
              )}
            >
              {labels.getInTouch}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
            </button>

            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2.5 rounded-full border border-border-strong px-7 py-3.5",
                "font-mono text-sm tracking-[var(--ls-button)] text-text",
                "transition-[background-color,border-color,transform] duration-200 ease-out",
                "hover:border-accent/50 hover:bg-accent-soft",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                "active:scale-[0.97]",
              )}
            >
              {labels.downloadResume}
            </a>
          </div>

          <div className="flex items-center gap-3 pt-4 text-text-faint">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-border-soft">
              <ArrowDown
                className="h-4 w-4 animate-bounce"
                aria-hidden="true"
              />
            </span>
            <span className="font-mono text-xs tracking-[var(--ls-eyebrow)]">
              {labels.scroll}
            </span>
          </div>
        </div>

        {/* Code-window artifact */}
        <div className="relative min-w-0 lg:col-span-6">
          {/*
            The artifact is a code editor, so it always speaks Latin: the base
            (English) values are passed deliberately rather than the localized
            ones. A Persian name inside a `dir="ltr"` code block would be
            reordered by the bidi algorithm and read as broken source.
          */}
          <HeroCodeWindow
            name={content.heroTitle}
            role={content.heroSubtitle}
            stack={stack}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * The hero artifact: a glass editor window.
 * ------------------------------------------------------------------ */

type Tone = "kw" | "prop" | "str" | "punc" | "bool" | "plain" | "cmt";

interface Token {
  text: string;
  tone: Tone;
}

const TONE_CLASS: Record<Tone, string> = {
  kw: "text-accent-2",
  prop: "text-text",
  str: "text-accent",
  punc: "text-text-faint",
  bool: "text-accent-strong",
  plain: "text-text-muted",
  cmt: "text-text-faint italic",
};

/** The snippet is data-driven: name, role and stack come from managed data. */
function buildCode(name: string, role: string, stack?: string[]): Token[][] {
  // The stack line is built from the skills collection; the fallback keeps the
  // artifact readable before the owner has added any skills.
  const tech = (stack && stack.length > 0 ? stack : ["React", "Next.js", "TS"])
    .slice(0, 3)
    .map((item) => `"${item}"`);

  const stackTokens: Token[] = [
    { text: "  stack", tone: "prop" },
    { text: ": [", tone: "punc" },
  ];
  tech.forEach((item, index) => {
    if (index > 0) stackTokens.push({ text: ", ", tone: "punc" });
    stackTokens.push({ text: item, tone: "str" });
  });
  stackTokens.push({ text: "],", tone: "punc" });

  return [
    [{ text: "// built with intent, shipped with care", tone: "cmt" }],
    [
      { text: "const ", tone: "kw" },
      { text: "developer", tone: "prop" },
      { text: " = {", tone: "punc" },
    ],
    [
      { text: "  name", tone: "prop" },
      { text: ": ", tone: "punc" },
      { text: `"${name}"`, tone: "str" },
      { text: ",", tone: "punc" },
    ],
    [
      { text: "  role", tone: "prop" },
      { text: ": ", tone: "punc" },
      { text: `"${role}"`, tone: "str" },
      { text: ",", tone: "punc" },
    ],
    stackTokens,
    [
      { text: "  focus", tone: "prop" },
      { text: ": [", tone: "punc" },
      { text: '"a11y"', tone: "str" },
      { text: ", ", tone: "punc" },
      { text: '"performance"', tone: "str" },
      { text: "],", tone: "punc" },
    ],
    [
      { text: "  openToWork", tone: "prop" },
      { text: ": ", tone: "punc" },
      { text: "true", tone: "bool" },
      { text: ",", tone: "punc" },
    ],
    [{ text: "};", tone: "punc" }],
    [],
    [
      { text: "export default ", tone: "kw" },
      { text: "developer", tone: "prop" },
      { text: ";", tone: "punc" },
    ],
  ];
}

/**
 * Whether the pointer tilt should run.
 *
 * Only on a real pointer (a touch device has no hover to track) and only when
 * the visitor has not asked for reduced motion.
 */
function useTiltEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setEnabled(fine.matches && !reduce.matches);
    apply();
    fine.addEventListener("change", apply);
    reduce.addEventListener("change", apply);
    return () => {
      fine.removeEventListener("change", apply);
      reduce.removeEventListener("change", apply);
    };
  }, []);

  return enabled;
}

function HeroCodeWindow({
  name,
  role,
  stack,
}: {
  name: string;
  role: string;
  stack?: string[];
}) {
  const tilt = useTiltEnabled();
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 140,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-11, 11]), {
    stiffness: 140,
    damping: 18,
  });

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!tilt) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const lines = buildCode(name, role, stack);
  const chips = (
    stack && stack.length > 0 ? stack : ["React", "Next.js"]
  ).slice(0, 2);

  return (
    <div className="relative mx-auto w-full max-w-lg [perspective:1600px]">
      {/* Ambient glow behind the artifact */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-accent-glow/25 blur-[100px]"
      />

      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative"
      >
        {/* Parallax depth planes (only visible once the card tilts) */}
        <div
          aria-hidden="true"
          className="absolute inset-x-10 -bottom-6 top-6 rounded-2xl border border-border-soft/50 bg-surface/15"
          style={{ transform: "translateZ(-70px)" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-5 -bottom-3 top-3 rounded-2xl border border-border-soft/70 bg-surface/25"
          style={{ transform: "translateZ(-35px)" }}
        />

        {/* The window */}
        <div
          aria-hidden="true"
          // Code is always left-to-right. Without this the bidi algorithm
          // reorders the punctuation on the RTL page and the snippet reads
          // `} = const developer` instead of `const developer = {`.
          dir="ltr"
          className="relative overflow-hidden rounded-2xl border border-border-soft bg-bg-elevated/85 shadow-lg backdrop-blur-xl"
        >
          {/* Title bar */}
          <div className="flex items-center gap-3 border-b border-border-soft/70 px-4 py-3">
            <span className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
            </span>
            <span className="font-mono text-[0.7rem] text-text-faint">
              developer.ts
            </span>
          </div>

          {/* Code */}
          <div className="overflow-x-auto px-4 py-4 sm:px-5 sm:py-5">
            <pre className="font-mono text-[0.68rem] leading-[1.85] sm:text-[0.78rem]">
              {lines.map((tokens, i) => (
                <div key={i} className="flex gap-4 whitespace-pre">
                  <span className="w-4 shrink-0 select-none text-end text-text-faint/50">
                    {i + 1}
                  </span>
                  <code className="min-w-0">
                    {tokens.map((token, j) => (
                      <span key={j} className={TONE_CLASS[token.tone]}>
                        {token.text}
                      </span>
                    ))}
                    {/* Caret sits on the closing brace line */}
                    {i === lines.length - 1 && (
                      <span className="ms-0.5 inline-block h-[1.05em] w-[0.5ch] translate-y-[0.15em] bg-accent [animation:pulse-soft_1.4s_ease-in-out_infinite]" />
                    )}
                  </code>
                </div>
              ))}
            </pre>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between border-t border-border-soft/70 px-4 py-2 font-mono text-[0.6rem] text-text-faint">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              main
            </span>
            <span>TypeScript · UTF-8</span>
          </div>
        </div>

        {/* Floating tech chips (depth + life) */}
        <span
          className="absolute -end-5 top-14 hidden rounded-full border border-border-soft bg-surface/80 px-3 py-1.5 font-mono text-[0.65rem] text-text-muted shadow-md backdrop-blur-md lg:block [animation:float-soft_6s_ease-in-out_infinite]"
          style={{ transform: "translateZ(80px)" }}
        >
          {chips[0]}
        </span>
        <span
          className="absolute -start-6 bottom-10 hidden rounded-full border border-accent-2-line bg-surface/80 px-3 py-1.5 font-mono text-[0.65rem] text-accent-2 shadow-md backdrop-blur-md lg:block [animation:float-soft_7s_ease-in-out_infinite_reverse]"
          style={{ transform: "translateZ(60px)" }}
        >
          {chips[1] ?? chips[0]}
        </span>
      </motion.div>
    </div>
  );
}

export default HeroSection;
