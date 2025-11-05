'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  isRequired?: boolean
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, isRequired = false, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {isRequired ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
      </span>
    </label>
  ),
)
Label.displayName = 'Label'

export { Label }
