'use client'

/**
 * Label - asociación correcta label/control (accesibilidad WCAG).
 * El consumidor pasa htmlFor; el ESLint jsx-a11y/label-has-associated-control
 * no puede verificarlo estáticamente.
 */
/* eslint-disable jsx-a11y/label-has-associated-control */

import * as React from 'react'

import { cn } from '@/lib/utils'

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-base font-medium leading-normal pb-2 text-[#111418]',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className,
    )}
    {...props}
  />
))
Label.displayName = 'Label'

export { Label }
