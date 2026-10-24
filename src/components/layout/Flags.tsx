"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * Flag glyphs for the language switcher.
 *
 * Drawn as inline SVG rather than emoji: Windows ships no colour font for
 * regional-indicator pairs, so `🇮🇷` renders as the letters "IR" there — which
 * is exactly the text label the flags are replacing. The tile is 3:2 for both
 * flags so the two controls stay optically the same size even though the real
 * flags have different proportions.
 */

interface FlagProps {
  /** Sizing classes; the glyph fills whatever box it is given. */
  className?: string;
}

function Tile({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-inset ring-black/30",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function IranFlag({ className }: FlagProps) {
  const clip = `ir-${useId().replace(/:/g, "")}`;

  return (
    <Tile className={className}>
      <svg
        viewBox="0 0 24 16"
        className="h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={clip}>
            <rect width="24" height="16" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clip})`}>
          <rect width="24" height="16" fill="#ffffff" />
          <rect width="24" height="5.34" fill="#239f40" />
          <rect y="10.66" width="24" height="5.34" fill="#da0000" />
          {/* Simplified emblem: the real one is an intricate calligraphic
              tulip that turns to mush below 24 px, so only its silhouette is
              drawn — a red mark centred in the white band. */}
          <g fill="#da0000">
            <path d="M12 5.7 12.5 6.8 12 7.9 11.5 6.8Z" />
            <rect x="11.72" y="7.6" width="0.56" height="2.1" rx="0.28" />
            <path
              d="M10.6 6.4c.45.85.42 2.1-.05 3"
              fill="none"
              stroke="#da0000"
              strokeWidth="0.42"
              strokeLinecap="round"
            />
            <path
              d="M13.4 6.4c-.45.85-.42 2.1.05 3"
              fill="none"
              stroke="#da0000"
              strokeWidth="0.42"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </Tile>
  );
}

export function UnitedKingdomFlag({ className }: FlagProps) {
  const clip = `gb-${useId().replace(/:/g, "")}`;

  return (
    <Tile className={className}>
      <svg
        viewBox="0 0 60 30"
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={clip}>
            <rect width="60" height="30" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clip})`}>
          <rect width="60" height="30" fill="#012169" />
          {/* The diagonals are drawn symmetrically. A true Union Jack offsets
              the red saltire, but that asymmetry is invisible at 24 px and
              costs four extra clipped paths. */}
          <path d="M0 0 60 30M60 0 0 30" stroke="#ffffff" strokeWidth="6" />
          <path d="M0 0 60 30M60 0 0 30" stroke="#c8102e" strokeWidth="3.4" />
          <path d="M30 0v30M0 15h60" stroke="#ffffff" strokeWidth="10" />
          <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6" />
        </g>
      </svg>
    </Tile>
  );
}
