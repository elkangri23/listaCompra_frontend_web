import * as React from 'react'

import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'
}

const badgeStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border text-foreground',
  success: 'bg-emerald-500/90 text-white',
  warning: 'bg-amber-400 text-black',
  destructive: 'bg-destructive text-destructive-foreground',
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, children, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        badgeStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)

Badge.displayName = 'Badge'
