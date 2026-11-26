'use client'

/**
 * Textarea - campo multilínea con el estilo de los inputs del proyecto
 */

import * as React from 'react'

import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'form-input flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-[#111418]',
        'border border-[#dbdfe6] bg-white focus:outline-0 focus:ring-0 focus:border-[#4387f4]',
        'placeholder:text-[#60708a] p-[15px] text-base font-normal leading-normal',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export { Textarea }
