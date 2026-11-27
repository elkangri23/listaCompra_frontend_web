'use client'

/**
 * Button - shadcn/ui sobre Radix Slot con la paleta del proyecto
 * (primary #2563eb · texto #111418 · borde #dbdfe6)
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold leading-normal tracking-[0.015em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]',
        outline:
          'border border-[#dbdfe6] bg-white text-[#111418] hover:bg-[#f0f2f5]',
        secondary: 'bg-[#f0f2f5] text-[#111418] hover:bg-[#e2e6ec]',
        ghost: 'text-[#111418] hover:bg-[#f0f2f5]',
        destructive: 'bg-[#dc2626] text-white hover:bg-[#b91c1c]',
        link: 'text-[#2563eb] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 min-w-[84px] px-4',
        sm: 'h-8 min-w-[64px] rounded-md px-3 text-xs',
        lg: 'h-12 min-w-[120px] rounded-lg px-6 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...(asChild ? {} : { type: type ?? 'button' })}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
