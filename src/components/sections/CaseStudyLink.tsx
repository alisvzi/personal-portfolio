"use client";

import Link, { useLinkStatus } from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The "case study" call to action on a project card.
 *
 * A plain `<Link>` gives no feedback while a server-rendered page is being
 * fetched, which on a slow connection reads as "the click did nothing". The
 * inner component sits inside the `<Link>`, so `useLinkStatus()` reports
 * *this* link's pending state — the arrow becomes a spinner the instant the
 * navigation starts, and only for the card that was actually clicked.
 */
function CtaInner({ label }: { label: string }) {
  const { pending } = useLinkStatus();

  return (
    <>
      {pending && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      <span>{label}</span>
      {!pending && (
        <ArrowRight
          aria-hidden="true"
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5 rtl:rotate-180 rtl:group-hover/cta:-translate-x-0.5"
        />
      )}
    </>
  );
}

interface CaseStudyLinkProps {
  href: string;
  label: string;
  className?: string;
}

export function CaseStudyLink({ href, label, className }: CaseStudyLinkProps) {
  return (
    <Link href={href} className={cn("group/cta", className)}>
      <CtaInner label={label} />
    </Link>
  );
}

export default CaseStudyLink;
