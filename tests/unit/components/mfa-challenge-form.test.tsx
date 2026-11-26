/**
 * Tests unitarios - mfa-challenge-form.tsx (paso 2 del login dos fases)
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MfaChallengeForm } from '@/features/auth/components/mfa-challenge-form'

describe('MfaChallengeForm', () => {
  const onSubmit = jest.fn()
  const onCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    render(<MfaChallengeForm onSubmit={onSubmit} onCancel={onCancel} />)
  })

  it('renderiza el título y el campo de código con a11y', () => {
    expect(
      screen.getByRole('heading', { name: 'Verificación en dos pasos' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Código de verificación')).toHaveAttribute(
      'autocomplete',
      'one-time-code',
    )
    expect(screen.getByLabelText('Código de verificación')).toHaveAttribute(
      'inputmode',
      'numeric',
    )
  })

  it('valida que el código tenga 6 dígitos antes de enviar', async () => {
    await userEvent.type(screen.getByLabelText('Código de verificación'), '12')
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'El código debe tener 6 dígitos.',
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envía code válido y limpia los dígitos no numéricos', async () => {
    const input = screen.getByLabelText('Código de verificación')
    await userEvent.type(input, '12a3456') // el input filtra "a" → "123456"
    expect(input).toHaveValue('123456')
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }))
    expect(onSubmit).toHaveBeenCalledWith({ code: '123456' })
  })

  it('cambia a modo backup, cancela los errores y envía backupCode', async () => {
    await userEvent.click(
      screen.getByRole('button', { name: 'Usar un código de respaldo' }),
    )
    expect(
      screen.getByText('Introduce uno de tus códigos de respaldo.'),
    ).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Código de respaldo'), 'AB')
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'El código de respaldo debe tener al menos 6 caracteres.',
    )
    expect(onSubmit).not.toHaveBeenCalled()

    await userEvent.clear(screen.getByLabelText('Código de respaldo'))
    await userEvent.type(
      screen.getByLabelText('Código de respaldo'),
      'A3F9-K2M7',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }))
    expect(onSubmit).toHaveBeenCalledWith({ backupCode: 'A3F9-K2M7' })
  })

  it('muestra el mensaje de error externo con aria-live', () => {
    const { unmount } = render(
      <MfaChallengeForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        errorMessage="El código no es válido."
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'El código no es válido.',
    )
    unmount()
  })

  it('isPending deshabilita botones y muestra "Verificando…"', () => {
    render(
      <MfaChallengeForm onSubmit={onSubmit} onCancel={onCancel} isPending />,
    )
    const submitButton = screen.getByRole('button', { name: 'Verificando…' })
    expect(submitButton).toBeDisabled()
  })

  it('onCancel al pulsar "Volver a iniciar sesión"', async () => {
    await userEvent.click(
      screen.getByRole('button', { name: 'Volver a iniciar sesión' }),
    )
    expect(onCancel).toHaveBeenCalled()
  })

  it('el input recibe el foco inicial', async () => {
    await waitFor(() => {
      expect(screen.getByLabelText('Código de verificación')).toHaveFocus()
    })
  })
})
