import * as React from 'react'
import { clsx } from 'clsx'

import styles from './typography.module.css'

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel
}

const headingStyles: Record<HeadingLevel, string> = {
  1: clsx(styles.headingBase, styles.heading1),
  2: clsx(styles.headingBase, styles.heading2),
  3: clsx(styles.headingBase, styles.heading3),
  4: clsx(styles.headingBase, styles.heading4),
  5: clsx(styles.headingBase, styles.heading5),
  6: clsx(styles.headingBase, styles.heading6),
}

type HeadingTag = `h${HeadingLevel}`

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, children, ...props }, ref) => {
    const Component = (`h${level}` as HeadingTag) || 'h2'
    const headingClassName = headingStyles[level] ?? headingStyles[2]

    return (
      <Component
        ref={ref}
        className={clsx(headingClassName, className)}
        {...props}
      >
        {children}
      </Component>
    )
  },
)
Heading.displayName = 'Heading'

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'lead' | 'muted' | 'small'
}

const textStyles: Record<NonNullable<TextProps['variant']>, string> = {
  default: clsx(styles.textBase, styles.textDefault),
  lead: clsx(styles.textBase, styles.textLead),
  muted: clsx(styles.textBase, styles.textMuted),
  small: clsx(styles.textBase, styles.textSmall),
}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <p
      ref={ref}
      className={clsx(textStyles[variant], className)}
      {...props}
    >
      {children}
    </p>
  ),
)
Text.displayName = 'Text'
