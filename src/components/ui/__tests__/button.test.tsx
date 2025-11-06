import { fireEvent, render, screen } from '@testing-library/react'

import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(
      <Button onClick={handleClick}>
        Guardar
      </Button>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('exposes variant metadata for styling validation', () => {
    const { rerender } = render(
      <Button variant="secondary">Secundario</Button>,
    )

    expect(screen.getByRole('button').dataset.variant).toBe('secondary')

    rerender(<Button variant="outline">Outline</Button>)

    expect(screen.getByRole('button').dataset.variant).toBe('outline')
  })
})
