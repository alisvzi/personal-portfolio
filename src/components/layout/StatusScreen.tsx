"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { localeFromPathname, stateStrings } from "@/i18n/states";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type StatusVariant = "loading" | "notFound";

interface StatusScreenProps {
  variant: StatusVariant;
}

/**
 * Full-screen loading and 404 screens.
 *
 * A Client Component because Next.js renders `loading.tsx` and `not-found.tsx`
 * without route params; the locale is read from the pathname instead, so the
 * screen matches the language of the page being loaded.
 */
export default function StatusScreen({ variant }: StatusScreenProps) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const strings = stateStrings(locale);

  if (variant === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen flex-col items-center justify-center bg-bg"
      >
        <LoadingSpinner size="xl" />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 font-mono text-sm text-text-muted"
        >
          {strings.loadingPortfolio}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <p aria-hidden="true" className="font-mono text-7xl font-bold text-accent">
        404
      </p>
      <h1 className="mt-6 text-2xl font-bold text-text md:text-3xl">
        {strings.notFoundTitle}
      </h1>
      <p className="mt-3 max-w-md text-text-muted">{strings.notFoundBody}</p>
      <Link
        href={`/${locale}`}
        className="mt-8 inline-flex items-center rounded-lg border border-accent px-6 py-3 font-mono text-sm text-accent transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        {strings.backHome}
      </Link>
    </div>
  );
}
