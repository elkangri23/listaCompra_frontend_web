'use client'

/**
 * Badge - etiqueta con variantes semánticas del proyecto
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#2563eb] text-white',
        secondary: 'border-transparent bg-[#f0f2f5] text-[#111418]',
        success: 'border-transparent bg-[#047857] text-white',
        destructive: 'border-transparent bg-[#dc2626] text-white',
        outline: 'border-[#dbdfe6] text-[#111418]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
