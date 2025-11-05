import { render, screen } from '@testing-library/react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

describe('Card', () => {
  it('renders title and description', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
          <CardDescription>Detalles principales</CardDescription>
        </CardHeader>
        <CardContent>Contenido</CardContent>
      </Card>,
    )

    expect(screen.getByText('Resumen')).toBeInTheDocument()
    expect(screen.getByText('Detalles principales')).toBeInTheDocument()
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })
})
