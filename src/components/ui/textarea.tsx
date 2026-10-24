import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-text-faint flex field-sizing-content min-h-24 w-full rounded-lg border border-border-soft bg-bg-elevated/60 px-3 py-2 text-sm leading-relaxed text-text shadow-[inset_0_1px_2px_oklch(0%_0_0/0.25)] transition-[color,box-shadow,border-color] outline-none hover:border-border-strong focus-visible:border-accent-strong/60 focus-visible:ring-2 focus-visible:ring-accent-strong/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500/60 aria-invalid:ring-2 aria-invalid:ring-red-500/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
