import * as React from 'react'

import { cn } from '@/lib/utils'

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel
}

const headingStyles: Record<HeadingLevel, string> = {
  1: 'scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl',
  2: 'scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0',
  3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  5: 'scroll-m-20 text-lg font-semibold tracking-tight',
  6: 'scroll-m-20 text-base font-semibold tracking-tight uppercase',
}

type HeadingTag = `h${HeadingLevel}`

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, children, ...props }, ref) => {
    const Component = (`h${level}` as HeadingTag) || 'h2'
    const styles = headingStyles[level] ?? headingStyles[2]

    return (
      <Component
        ref={ref}
        className={cn(styles, className)}
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
  default: 'leading-relaxed text-base text-foreground',
  lead: 'text-lg text-muted-foreground',
  muted: 'text-sm text-muted-foreground',
  small: 'text-xs font-medium text-muted-foreground uppercase tracking-wide',
}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(textStyles[variant], className)}
      {...props}
    >
      {children}
    </p>
  ),
)
Text.displayName = 'Text'
