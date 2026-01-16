import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        success:
          "border-transparent bg-success text-success-foreground",
        warning:
          "border-transparent bg-warning text-warning-foreground",
        info:
          "border-transparent bg-info text-info-foreground",
        outline: "text-foreground",
        // Platform-specific badges
        amazon:
          "border-transparent bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
        tiktok:
          "border-transparent bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300",
        instagram:
          "border-transparent bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
        youtube:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
        pinterest:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
