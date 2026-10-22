"use client";

import Link from "next/link";
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
 *
 * The one exception is `digest`. In production React replaces a Server
 * Component failure with a generic "An error occurred in the Server Components
 * render" (error #441) and strips the message; the digest is the only handle
 * that links the browser report to the matching line in the server log. It is
 * an opaque hash, carries no data, and without it a production failure is
 * effectively undebuggable.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const strings = stateStrings(locale);

  useEffect(() => {
    console.error("[app] Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <h1 className="text-2xl font-bold text-text md:text-3xl">
        {strings.errorTitle}
      </h1>
      <p className="mt-3 max-w-md text-text-muted">{strings.errorBody}</p>

      {error.digest ? (
        <p className="mt-6 text-xs text-text-muted/60">
          {strings.errorRef}{" "}
          <span dir="ltr" className="select-all font-mono">
            {error.digest}
          </span>
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-lg border border-accent px-6 py-3 font-mono text-sm text-accent transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          {strings.retry}
        </button>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center rounded-lg border border-border px-6 py-3 font-mono text-sm text-text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          {strings.backHome}
        </Link>
      </div>
    </div>
  );
}
