import { render, screen } from '@testing-library/react'

import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('renders with placeholder text', () => {
    render(<Input placeholder="Nombre" />)

    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument()
  })

  it('supports disabled state', () => {
    render(<Input placeholder="Email" disabled />)

    const input = screen.getByPlaceholderText('Email')
    expect(input).toBeDisabled()
  })
})
