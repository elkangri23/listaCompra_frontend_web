import type { Meta, StoryObj } from '@storybook/react'

import { Heading, Text } from './typography'

const meta: Meta<typeof Heading> = {
  title: 'Fundamentos/Tipografía',
  component: Heading,
  parameters: {
    docs: {
      description: {
        component:
          'Escalas tipográficas alineadas a tokens responsivos. Combina la familia principal (Inter) y display (DM Sans).',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof Heading>

export const Escalas: Story = {
  render: () => (
    <div className="space-y-6">
      <Heading level={1}>H1 — Lista de compras colaborativas</Heading>
      <Heading level={2}>H2 — Organización en tiempo real</Heading>
      <Heading level={3}>H3 — Recordatorios inteligentes</Heading>
      <Heading level={4}>H4 — Historial de compras</Heading>
      <Text>
        El sistema tipográfico busca balancear jerarquía, legibilidad y tono humano. Las familias de fuentes se exponen a
        través de tokens que permiten ajustes globales sin modificar componentes.
      </Text>
      <Text variant="muted">
        Las variantes lead, muted y small ayudan a diferenciar estados, notas y metadatos en las interfaces.
      </Text>
    </div>
  ),
}
