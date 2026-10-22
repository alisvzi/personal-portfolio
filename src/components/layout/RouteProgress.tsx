"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Top-of-page route progress bar.
 *
 * The App Router gives no built-in "a navigation is in flight" signal that a
 * layout can render, and this site's pages are server-rendered from MongoDB —
 * so a click on a project card can take a moment with nothing on screen to
 * acknowledge it. This component closes that gap: any same-origin link click
 * raises a thin indeterminate bar immediately, and the bar is dismissed when
 * the pathname actually changes.
 *
 * Why it writes to the DOM instead of React state: the show/hide cycle is
 * driven by a document-level event listener and a pathname change, and calling
 * `setState` from either would re-render the whole layout for a 2px decoration.
 * Toggling one attribute keeps it off React's critical path entirely.
 *
 * It is deliberately conservative about what counts as a navigation — hash
 * links, modified clicks, new-tab links, downloads, external origins and
 * same-URL clicks are all ignored, so the bar can never get stuck on.
 */

/** If the route never changes (failed fetch, cancelled navigation), give up. */
const SAFETY_TIMEOUT_MS = 12_000;

interface RouteProgressProps {
  /** Screen-reader announcement, e.g. "Loading…". */
  label: string;
}

export default function RouteProgress({ label }: RouteProgressProps) {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const status = statusRef.current;
    if (!bar) return;

    let timeout: number | undefined;

    const hide = () => {
      bar.removeAttribute("data-active");
      if (status) status.textContent = "";
      if (timeout) window.clearTimeout(timeout);
      timeout = undefined;
    };

    const show = () => {
      bar.setAttribute("data-active", "true");
      if (status) status.textContent = label;
      if (timeout) window.clearTimeout(timeout);
      timeout = window.setTimeout(hide, SAFETY_TIMEOUT_MS);
    };

    const onClick = (event: MouseEvent) => {
      // Only plain left-clicks navigate in-place.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      // Opt-out hatch for links that intentionally do not navigate.
      if (anchor.dataset.noProgress !== undefined) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      // Same page (only the hash or query changed) — no server round trip.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      show();
    };

    // Back/forward also re-renders a server component.
    const onPopState = () => show();

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPopState);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [label]);

  // The navigation has committed: drop the bar.
  useEffect(() => {
    const bar = barRef.current;
    bar?.removeAttribute("data-active");
    if (statusRef.current) statusRef.current.textContent = "";
  }, [pathname]);

  return (
    <>
      <div ref={barRef} aria-hidden="true" className="route-progress">
        <span className="route-progress__bar" />
      </div>
      {/* Announces the wait to assistive technology, which cannot see the bar. */}
      <span ref={statusRef} role="status" aria-live="polite" className="sr-only" />
    </>
  );
}
