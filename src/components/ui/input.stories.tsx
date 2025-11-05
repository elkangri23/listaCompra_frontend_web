import type { Meta, StoryObj } from '@storybook/react'

import { Input, type InputProps } from './input'
import { Label } from './label'

const meta: Meta<InputProps> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component: 'Campo de texto base con soporte para estados disabled, placeholders descriptivos y accesibilidad ARIA.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="space-y-2">
        <Label htmlFor="demo" isRequired>
          Nombre de la lista
        </Label>
        <Story />
      </div>
    ),
  ],
  args: {
    id: 'demo',
    placeholder: 'Compra semanal',
  },
}

export default meta

type Story = StoryObj<InputProps>

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
