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
        'border border-[#dbdfe6] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 focus:border-[#2563eb]',
        'placeholder:text-[#5b6b82] p-[15px] text-base font-normal leading-normal',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export { Textarea }
