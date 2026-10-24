"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * The site mark: a cyan "A" on a deep navy tile.
 *
 * Geometry is duplicated in `public/icons/mark.svg`, which is the file the
 * favicon and the install icons are rasterised from. They are deliberately
 * separate: this one inherits sizing from CSS and lives in the React tree,
 * while the raster source has to stand alone for `sharp`. Change both together.
 */
export function BrandMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const tile = `tile-${id}`;
  const ink = `ink-${id}`;
  const glow = `glow-${id}`;

  return (
    <svg
      viewBox="0 0 512 512"
      className={cn("size-9", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={tile} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#16293f" />
          <stop offset="1" stopColor="#070f1d" />
        </linearGradient>
        <linearGradient id={ink} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#9dffe9" />
          <stop offset="1" stopColor="#3ad7b4" />
        </linearGradient>
        <radialGradient id={glow} cx="0.25" cy="0.12" r="0.85">
          <stop offset="0" stopColor="#64ffda" stopOpacity="0.22" />
          <stop offset="1" stopColor="#64ffda" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="512" height="512" rx="116" fill={`url(#${tile})`} />
      <rect width="512" height="512" rx="116" fill={`url(#${glow})`} />

      <path
        d="M152 366 256 152 360 366"
        fill="none"
        stroke={`url(#${ink})`}
        strokeWidth="56"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M176 314h160"
        fill="none"
        stroke={`url(#${ink})`}
        strokeWidth="54"
        strokeLinecap="round"
      />
    </svg>
  );
}
