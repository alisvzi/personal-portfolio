import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,background-color,border-color] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent-strong text-bg [a&]:hover:brightness-110",
        secondary:
          "border-accent-line bg-accent-soft text-accent-strong [a&]:hover:bg-accent-strong/20",
        destructive:
          "border-red-500/35 bg-red-500/12 text-red-300 [a&]:hover:bg-red-500/20",
        outline:
          "border-border-strong text-text-muted [a&]:hover:bg-surface-2 [a&]:hover:text-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
