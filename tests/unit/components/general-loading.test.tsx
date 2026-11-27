import { render, screen } from '@testing-library/react'

import { GeneralLoading } from '@/components/layout/general-loading'

describe('GeneralLoading (WCAG AA)', () => {
  it('anuncia la carga con role="status" y texto sr-only en español', () => {
    render(<GeneralLoading />)

    const status = screen.getByRole('status', { name: /cargando/i })
    expect(status).toBeInTheDocument()
    expect(screen.getByText('Cargando…')).toHaveClass('sr-only')
  })

  it('mantiene el indicador visual de carga', () => {
    const { container } = render(<GeneralLoading />)

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })
})
