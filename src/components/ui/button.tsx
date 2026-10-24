import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button.
 *
 * The variants are authored against the portfolio's design tokens rather than
 * the shadcn defaults they shipped with: those defaults assume a neutral light
 * palette (`bg-primary` was a dark navy, `hover:bg-accent` a near-white), so on
 * the deep-navy dashboard a primary button was nearly invisible and a ghost
 * button flashed white on hover. Every consumer of this component is the admin
 * panel, which is why the mapping can be changed without touching the site.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[color,background-color,border-color,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent-strong/40",
  {
    variants: {
      variant: {
        default:
          "bg-accent-strong text-bg shadow-[inset_0_1px_0_oklch(100%_0_0/0.25)] hover:brightness-110",
        destructive:
          "border border-red-500/35 bg-red-500/12 text-red-300 hover:bg-red-500/20",
        outline:
          "border border-border-strong bg-transparent text-text hover:border-accent-strong/45 hover:bg-surface-2",
        secondary: "bg-surface-2 text-text hover:bg-surface-3",
        ghost: "text-text-muted hover:bg-surface-2 hover:text-text",
        link: "text-accent-strong underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-lg px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
