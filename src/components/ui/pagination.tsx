'use client'

/**
 * Pagination - navegación accesible (nav aria-label, current via aria-current).
 * El contenido de los enlaces lo provee el consumidor; la regla
 * jsx-a11y/anchor-has-content no puede verificarlo estáticamente.
 */
/* eslint-disable jsx-a11y/anchor-has-content */

import * as React from 'react'

import { cn } from '@/lib/utils'

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="Paginación"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

const linkBase =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4387f4] disabled:pointer-events-none disabled:opacity-60'

const PaginationLink = ({
  className,
  isActive,
  ...props
}: React.ComponentProps<'a'> & { isActive?: boolean }) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      linkBase,
      isActive
        ? 'bg-[#4387f4] text-white'
        : 'text-[#111418] hover:bg-[#f0f2f5]',
      className,
    )}
    {...props}
  />
)
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Página anterior"
    className={cn('px-2.5', className)}
    {...props}
  />
)
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Página siguiente"
    className={cn('px-2.5', className)}
    {...props}
  />
)
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn(
      'flex h-9 min-w-9 items-center justify-center text-[#60708a]',
      className,
    )}
    {...props}
  >
    …
  </span>
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
