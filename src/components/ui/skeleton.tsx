/**
 * Skeleton — bloques de carga con forma del contenido que va a llegar.
 * Decorativos (aria-hidden); el estado de carga lo anuncia el contenedor
 * de cada pantalla con role="status" y texto sr-only.
 */

import * as React from 'react'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-[#e5e8ec] motion-reduce:animate-none',
        className,
      )}
      style={style}
    />
  )
}

/** Fila genérica: círculo + 2 líneas (listas, invitaciones, historial…). */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3" aria-hidden="true">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  )
}

/** Tarjeta genérica (panel, plantillas, hábitos, notificaciones, métricas). */
export function SkeletonCard() {
  return (
    <div
      className="flex flex-col gap-3 rounded-[10px] border border-[#dbdfe6] bg-white p-4"
      aria-hidden="true"
    >
      <Skeleton className="h-5 w-3/5" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="mt-2 flex gap-2">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
    </div>
  )
}

/** Formulario (perfil): 3 campos con etiqueta + hueco de input. */
export function SkeletonForm() {
  return (
    <div className="flex max-w-[480px] flex-col gap-5 px-4 py-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32" />
    </div>
  )
}
