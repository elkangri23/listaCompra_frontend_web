import type { Meta, StoryObj } from '@storybook/react'

import { Button, type ButtonProps } from './button'

const meta: Meta<ButtonProps> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Botón accesible con variantes de estilo alineadas al sistema de diseño ListaCompra. Soporta estado disabled, iconos y uso como enlace.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
  args: {
    children: 'Acción primaria',
  },
}

export default meta

type Story = StoryObj<ButtonProps>

export const Default: Story = {
  args: {
    variant: 'default',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
  },
}
