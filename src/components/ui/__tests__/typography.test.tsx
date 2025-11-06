import { render, screen } from '@testing-library/react'

import { Heading, Text } from '@/components/ui/typography'

describe('Typography components', () => {
  it('renders heading with correct level', () => {
    render(<Heading level={3}>Sección</Heading>)

    const heading = screen.getByRole('heading', { name: 'Sección', level: 3 })
    expect(heading.tagName.toLowerCase()).toBe('h3')
  })

  it('renders text variants', () => {
    render(
      <div>
        <Text data-testid="default">Default</Text>
        <Text data-testid="muted" variant="muted">
          Muted
        </Text>
      </div>,
    )

    expect(screen.getByTestId('default')).toHaveClass('text-base');
    expect(screen.getByTestId('default')).toHaveClass('text-foreground');
    expect(screen.getByTestId('muted')).toHaveClass('text-muted-foreground')
  })
})
