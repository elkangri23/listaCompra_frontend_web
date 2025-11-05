import type { Meta, StoryObj } from '@storybook/react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'
import { Button } from './button'
import { Text } from './typography'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          'Contenedor flexible con encabezado, contenido y pie opcionales. Utiliza tokens de color para adaptarse a cualquier tema.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof Card>

export const Overview: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Lista compartida</CardTitle>
        <CardDescription>Organiza productos con tu equipo en tiempo real.</CardDescription>
      </CardHeader>
      <CardContent>
        <Text>
          Notifica a tus colaboradores cuando un producto se marca como comprado. Mantén historial y comentarios en un solo
          lugar.
        </Text>
      </CardContent>
      <CardFooter className="justify-between">
        <Text className="text-sm text-muted-foreground">Actualizado hace 5 minutos</Text>
        <Button size="sm">Ver detalles</Button>
      </CardFooter>
    </Card>
  ),
}
