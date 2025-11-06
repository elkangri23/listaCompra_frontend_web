import * as React from 'react'
import { clsx } from 'clsx'

import styles from './badge.module.css'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'
}

const badgeStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: styles.variantDefault,
  secondary: styles.variantSecondary,
  outline: styles.variantOutline,
  success: styles.variantSuccess,
  warning: styles.variantWarning,
  destructive: styles.variantDestructive,
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, children, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(styles.badgeBase, badgeStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  ),
)

Badge.displayName = 'Badge'
