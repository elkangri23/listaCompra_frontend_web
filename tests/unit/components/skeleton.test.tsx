import { render, screen } from '@testing-library/react'

import { Skeleton, SkeletonCard, SkeletonForm, SkeletonRow } from '@/components/ui/skeleton'

describe('Skeleton', () => {
  it('renderiza un bloque decorativo (aria-hidden, con animate-pulse)', () => {
    const { container } = render(<Skeleton className="h-4 w-24" />)
    const block = container.firstChild as HTMLElement
    expect(block).toHaveAttribute('aria-hidden', 'true')
    expect(block.className).toContain('animate-pulse')
  })

  it('SkeletonRow muestra círculo + líneas', () => {
    const { container } = render(<SkeletonRow />)
    expect(container.querySelector('.rounded-full')).toBeInTheDocument()
  })

  it('SkeletonCard muestra líneas y dos pastillas', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.querySelectorAll('.rounded-full').length).toBeGreaterThanOrEqual(2)
  })

  it('SkeletonForm muestra 3 campos + botón', () => {
    render(<SkeletonForm />)
    // 3 etiquetas + 3 inputs + 1 botón = 7 bloques
    expect(document.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(7)
  })
})
