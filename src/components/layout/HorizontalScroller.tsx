"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface ChapterNavValue {
  activeIndex: number;
  /** Continuous scroll progress across all chapters, `0`–`1`. */
  progress: number;
  goTo: (index: number) => void;
}

const ChapterNavContext = createContext<ChapterNavValue | null>(null);

/** Access the active chapter + navigation controls from any descendant. */
export function useChapters(): ChapterNavValue {
  const ctx = useContext(ChapterNavContext);
  if (!ctx) return { activeIndex: 0, progress: 0, goTo: () => {} };
  return ctx;
}

/** Wheel deltas below this (after normalising) are ignored as noise. */
const WHEEL_MIN_DELTA = 4;
/** One chapter per gesture, so a trackpad flick cannot skip several at once. */
const WHEEL_COOLDOWN_MS = 600;

interface HorizontalScrollerProps {
  children: ReactNode;
  locale: Locale;
  className?: string;
}

/**
 * Scroll engine for the chapter experience.
 *
 * Two modes, and the difference matters:
 *
 *  - **Horizontal** (desktop): `.horizontal-scroller` is `height: 100dvh` with
 *    `overflow-x: auto`, so *it* is the scroll container. The mouse wheel is
 *    translated into chapter steps, because `scroll-snap-type: x mandatory`
 *    would otherwise snap a small wheel nudge straight back to where it started.
 *  - **Vertical** (small screens / reduced motion): `.horizontal-scroller--vertical`
 *    is `height: auto`, so the element grows to fit its content and the **window**
 *    is the scroll container. Everything below therefore branches on `horizontal`
 *    — scrolling the element there is a silent no-op, which is exactly why the
 *    chapter nav appeared to do nothing on phones.
 *
 * Progress and the active chapter are derived from scroll position in a single
 * rAF-throttled pass, so both modes stay in sync and nothing runs per frame
 * unless the visitor is actually scrolling.
 */
export function HorizontalScroller({
  children,
  locale,
  className,
}: HorizontalScrollerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [horizontal, setHorizontal] = useState(true);
  const [progress, setProgress] = useState(0);

  // Mirrored into refs so the wheel listener can stay bound across renders
  // without being torn down and re-attached on every state change.
  const activeIndexRef = useRef(0);
  const goToRef = useRef<(index: number) => void>(() => {});
  const wheelLockRef = useRef(false);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 820px)");
    const apply = () => setHorizontal(!(reduce.matches || small.matches));
    apply();
    reduce.addEventListener("change", apply);
    small.addEventListener("change", apply);
    return () => {
      reduce.removeEventListener("change", apply);
      small.removeEventListener("change", apply);
    };
  }, []);

  const panels = useCallback((): HTMLElement[] => {
    const el = ref.current;
    if (!el) return [];
    return Array.from(el.querySelectorAll<HTMLElement>("[data-chapter]"));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const items = panels();
      if (items.length === 0) return;
      const idx = Math.max(0, Math.min(index, items.length - 1));
      const target = items[idx];
      if (!target) return;

      if (horizontal && ref.current) {
        // `offsetLeft` is RTL-aware (negative in RTL), unlike `clientWidth * i`.
        ref.current.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: "smooth" });
      }
    },
    [panels, horizontal],
  );

  useEffect(() => {
    goToRef.current = goTo;
  }, [goTo]);

  /**
   * Deep link into a chapter (`/#work`, the "back to work" link on a project
   * page).
   *
   * The browser's own fragment navigation cannot scroll a horizontally
   * snapped container reliably, so arriving with a hash would land the visitor
   * on the hero. Once the panels exist, the hash is resolved to a chapter index
   * and the scroller jumps there itself.
   */
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const target = document.getElementById(hash);
    if (!target) return;

    const index = panels().findIndex((panel) => panel.contains(target));
    if (index <= 0) return;

    // One frame, so the scroller has been measured at its final width.
    const frame = requestAnimationFrame(() => goTo(index));
    return () => cancelAnimationFrame(frame);
  }, [panels, goTo]);

  /**
   * Progress + active chapter, sampled on scroll and coalesced into one tick.
   *
   * The chapter count is read from the DOM at the point of use (`End` key,
   * `goTo` clamping) rather than mirrored into state: writing it from an effect
   * would trigger a cascading render on every mount for a value only two event
   * handlers ever need.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;

    const measure = () => {
      raf = 0;
      const items = panels();
      if (items.length === 0) return;

      if (horizontal) {
        // In RTL the scroller starts at `scrollLeft === 0` and goes *negative*,
        // so the absolute value is what yields a monotonic 0→1 range.
        const max = el.scrollWidth - el.clientWidth;
        const pos = Math.abs(el.scrollLeft);
        setProgress(max <= 0 ? 0 : Math.min(1, pos / max));

        let nearest = 0;
        let best = Number.POSITIVE_INFINITY;
        items.forEach((item, i) => {
          const distance = Math.abs(Math.abs(item.offsetLeft) - pos);
          if (distance < best) {
            best = distance;
            nearest = i;
          }
        });
        setActiveIndex(nearest);
      } else {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max)));

        // The chapter occupying the upper third of the viewport wins.
        const probe = window.innerHeight * 0.35;
        let current = 0;
        items.forEach((item, i) => {
          if (item.getBoundingClientRect().top <= probe) current = i;
        });
        setActiveIndex(current);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    const scrollTarget: HTMLElement | Window = horizontal ? el : window;
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      scrollTarget.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [panels, horizontal]);

  /**
   * Mouse wheel / trackpad → chapter step (horizontal mode only).
   *
   * `scroll-snap-type: x mandatory` means a raw wheel scroll would immediately
   * snap back to the nearest chapter, so the gesture is interpreted as "next /
   * previous chapter" instead — a vertical wheel turn and a horizontal
   * two-finger swipe both do the same thing. A chapter that is taller than the
   * viewport keeps its own vertical scrolling until it reaches the edge, then
   * the step happens.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el || !horizontal) return;

    const onWheel = (event: WheelEvent) => {
      // Never swallow pinch-zoom (Ctrl + wheel is the browser's zoom gesture).
      if (event.ctrlKey) return;

      // `deltaMode === 1` is "lines" (Firefox); normalise so the threshold and
      // the gesture feel the same across browsers.
      const scale = event.deltaMode === 1 ? 16 : 1;
      const dx = event.deltaX * scale;
      const dy = event.deltaY * scale;

      // A vertical wheel and a trackpad's horizontal two-finger swipe are the
      // same gesture here — both mean "move along the chapters" — so whichever
      // axis dominates drives the step. Without this, a horizontal swipe would
      // fall through to the native scroll and `scroll-snap-type: x mandatory`
      // would yank it straight back.
      const delta = Math.abs(dy) >= Math.abs(dx) ? dy : dx;
      if (Math.abs(delta) < WHEEL_MIN_DELTA) return;

      const panel = panels()[activeIndexRef.current];
      if (panel) {
        const atBottom =
          panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
        const atTop = panel.scrollTop <= 1;
        // Let the chapter finish scrolling internally before moving on.
        if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) return;
      }

      event.preventDefault();

      if (wheelLockRef.current) return;
      wheelLockRef.current = true;
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, WHEEL_COOLDOWN_MS);

      goToRef.current(activeIndexRef.current + (delta > 0 ? 1 : -1));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [horizontal, panels]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      const next = locale === "fa" ? "ArrowLeft" : "ArrowRight";
      const prev = locale === "fa" ? "ArrowRight" : "ArrowLeft";
      if (e.key === next) {
        e.preventDefault();
        goTo(activeIndex + 1);
      } else if (e.key === prev) {
        e.preventDefault();
        goTo(activeIndex - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(panels().length - 1);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [goTo, activeIndex, panels, locale]);

  return (
    <ChapterNavContext.Provider value={{ activeIndex, progress, goTo }}>
      <div
        ref={ref}
        tabIndex={0}
        aria-roledescription="serial chapters"
        className={cn(
          "horizontal-scroller",
          !horizontal && "horizontal-scroller--vertical",
          className,
        )}
      >
        {children}
      </div>
    </ChapterNavContext.Provider>
  );
}

export default HorizontalScroller;
