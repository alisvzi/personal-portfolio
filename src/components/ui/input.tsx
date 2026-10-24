import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input.
 *
 * Authored against the design tokens: the shadcn default paired a near-white
 * border with a transparent background, so on the navy dashboard every field
 * read as an empty outlined box with no affordance for where to type.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-text placeholder:text-text-faint selection:bg-accent-strong/30 selection:text-text flex h-10 w-full min-w-0 rounded-lg border border-border-soft bg-bg-elevated/60 px-3 py-1 text-sm text-text shadow-[inset_0_1px_2px_oklch(0%_0_0/0.25)] transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-border-strong",
        "focus-visible:border-accent-strong/60 focus-visible:ring-2 focus-visible:ring-accent-strong/20",
        "aria-invalid:border-red-500/60 aria-invalid:ring-2 aria-invalid:ring-red-500/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
