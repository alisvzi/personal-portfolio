"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { localeFromPathname, stateStrings } from "@/i18n/states";

/**
 * Error boundary for the locale layout.
 *
 * Next.js requires `error.tsx` to be a Client Component. The message shown to
 * the visitor is deliberately generic; the real error is logged to the console
 * for the developer, never rendered, so no stack trace or database detail can
 * leak into the page.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const strings = stateStrings(localeFromPathname(pathname));

  useEffect(() => {
    console.error("[app] Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <h1 className="text-2xl font-bold text-text md:text-3xl">
        {strings.errorTitle}
      </h1>
      <p className="mt-3 max-w-md text-text-muted">{strings.errorBody}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center rounded-lg border border-accent px-6 py-3 font-mono text-sm text-accent transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        {strings.retry}
      </button>
    </div>
  );
}
