import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-widest",
  {
    variants: {
      variant: {
        default: "neon-gradient-bg text-primary-foreground hover:opacity-90 neon-glow",
        destructive:
          "bg-error-container/10 text-error hover:bg-error-container/20 border border-error/20",
        outline:
          "ghost-border bg-transparent hover:bg-surface-container-high text-on-surface",
        secondary:
          "bg-surface-container-highest text-on-surface hover:bg-surface-high ghost-border",
        ghost: "hover:bg-surface-container-high text-on-surface-variant",
        link: "text-primary underline-offset-4 hover:underline normal-case tracking-normal p-0 h-auto",
        neon: "neon-gradient-bg text-primary-foreground hover:opacity-90 neon-glow",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-16 px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
