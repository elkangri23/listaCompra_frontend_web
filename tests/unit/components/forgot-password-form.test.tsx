/**
 * Tests - forgot-password-form.tsx
 * Restablecimiento de contraseña por código (item 9c): paso 1 correo,
 * paso 2 código + contraseña nueva, reenvío y panel de éxito.
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'
import {
  requestPasswordReset,
  resetPassword,
  resendPasswordResetCode,
} from '@/features/auth/services/auth-service'

jest.mock('@/features/auth/services/auth-service', () => ({
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn(),
  resendPasswordResetCode: jest.fn(),
}))

const goToStep2 = async () => {
  ;(requestPasswordReset as jest.Mock).mockResolvedValue(undefined)
  render(<ForgotPasswordForm />)
  await userEvent.type(
    screen.getByLabelText(/correo electrónico/i),
    'juan@example.com',
  )
  await userEvent.click(
    screen.getByRole('button', { name: /enviar el código/i }),
  )
  await waitFor(() => {
    expect(
      screen.getByRole('heading', { name: /pon tu contraseña nueva/i }),
    ).toBeInTheDocument()
  })
}

describe('ForgotPasswordForm (item 9c)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Paso 1: pedir el código', () => {
    it('debe renderizar el correo y el botón de enviar el código', () => {
      render(<ForgotPasswordForm />)

      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /enviar el código/i }),
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /inicia sesión/i })).toHaveAttribute(
        'href',
        '/login',
      )
    })

    it('debe rechazar un correo inválido sin llamar al servicio', async () => {
      render(<ForgotPasswordForm />)

      await userEvent.type(
        screen.getByLabelText(/correo electrónico/i),
        'no-es-email',
      )
      fireEvent.submit(screen.getByRole('button', { name: /enviar el código/i }))

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Ingresa un correo electrónico válido.',
      )
      expect(requestPasswordReset).not.toHaveBeenCalled()
    })

    it('debe pedir el código y pasar al paso 2', async () => {
      ;(requestPasswordReset as jest.Mock).mockResolvedValue(undefined)
      render(<ForgotPasswordForm />)

      await userEvent.type(
        screen.getByLabelText(/correo electrónico/i),
        'juan@example.com',
      )
      await userEvent.click(
        screen.getByRole('button', { name: /enviar el código/i }),
      )

      await waitFor(() => {
        expect(requestPasswordReset).toHaveBeenCalledWith({
          email: 'juan@example.com',
        })
      })
      expect(
        screen.getByRole('heading', { name: /pon tu contraseña nueva/i }),
      ).toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveTextContent(
        'Te hemos enviado un código de 6 dígitos a juan@example.com.',
      )
    })

    it('debe mostrar el error del backend al pedir el código', async () => {
      ;(requestPasswordReset as jest.Mock).mockRejectedValue(
        new Error('No se pudo enviar el código de recuperación.'),
      )
      render(<ForgotPasswordForm />)

      await userEvent.type(
        screen.getByLabelText(/correo electrónico/i),
        'juan@example.com',
      )
      await userEvent.click(
        screen.getByRole('button', { name: /enviar el código/i }),
      )

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'No se pudo enviar el código de recuperación.',
        )
      })
      expect(
        screen.queryByRole('heading', { name: /pon tu contraseña nueva/i }),
      ).not.toBeInTheDocument()
    })
  })

  describe('Paso 2: código y contraseña nueva', () => {
    it('debe rechazar un código con menos de 6 dígitos sin llamar al servicio', async () => {
      await goToStep2()

      await userEvent.type(screen.getByLabelText(/código de 6 dígitos/i), '123')
      await userEvent.type(
        screen.getByLabelText(/^contraseña nueva$/i),
        'NuevaPass123!',
      )
      await userEvent.type(
        screen.getByLabelText(/repite la contraseña nueva/i),
        'NuevaPass123!',
      )
      fireEvent.submit(
        screen.getByRole('button', { name: /cambiar la contraseña/i }),
      )

      expect(screen.getByRole('alert')).toHaveTextContent(
        'El código tiene 6 dígitos.',
      )
      expect(resetPassword).not.toHaveBeenCalled()
    })

    it('debe rechazar contraseñas que no coinciden', async () => {
      await goToStep2()

      await userEvent.type(screen.getByLabelText(/código de 6 dígitos/i), '482913')
      await userEvent.type(
        screen.getByLabelText(/^contraseña nueva$/i),
        'NuevaPass123!',
      )
      await userEvent.type(
        screen.getByLabelText(/repite la contraseña nueva/i),
        'OtraPass123!',
      )
      fireEvent.submit(
        screen.getByRole('button', { name: /cambiar la contraseña/i }),
      )

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Las contraseñas no coinciden.',
      )
      expect(resetPassword).not.toHaveBeenCalled()
    })

    it('debe restablecer la contraseña y mostrar el panel de éxito', async () => {
      ;(resetPassword as jest.Mock).mockResolvedValue({
        mensaje: 'Tu contraseña ha sido cambiada. Ya puedes entrar con la nueva.',
      })
      await goToStep2()

      await userEvent.type(screen.getByLabelText(/código de 6 dígitos/i), '482913')
      await userEvent.type(
        screen.getByLabelText(/^contraseña nueva$/i),
        'NuevaPass123!',
      )
      await userEvent.type(
        screen.getByLabelText(/repite la contraseña nueva/i),
        'NuevaPass123!',
      )
      await userEvent.click(
        screen.getByRole('button', { name: /cambiar la contraseña/i }),
      )

      await waitFor(() => {
        expect(resetPassword).toHaveBeenCalledWith({
          email: 'juan@example.com',
          codigo: '482913',
          nuevaPassword: 'NuevaPass123!',
        })
      })
      expect(
        screen.getByRole('heading', { name: /contraseña cambiada/i }),
      ).toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveTextContent(
        'Tu contraseña ha sido cambiada.',
      )
      expect(
        screen.getByRole('link', { name: /ir a iniciar sesión/i }),
      ).toHaveAttribute('href', '/login')
    })

    it('debe mostrar el error del backend con un código no válido', async () => {
      ;(resetPassword as jest.Mock).mockRejectedValue(
        new Error('El código no es válido o ha caducado.'),
      )
      await goToStep2()

      await userEvent.type(screen.getByLabelText(/código de 6 dígitos/i), '111111')
      await userEvent.type(
        screen.getByLabelText(/^contraseña nueva$/i),
        'NuevaPass123!',
      )
      await userEvent.type(
        screen.getByLabelText(/repite la contraseña nueva/i),
        'NuevaPass123!',
      )
      await userEvent.click(
        screen.getByRole('button', { name: /cambiar la contraseña/i }),
      )

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'El código no es válido o ha caducado.',
        )
      })
    })

    it('debe reenviar el código y mostrar el mensaje', async () => {
      ;(resendPasswordResetCode as jest.Mock).mockResolvedValue(undefined)
      await goToStep2()

      await userEvent.click(
        screen.getByRole('button', { name: /reenviar el código/i }),
      )

      await waitFor(() => {
        expect(resendPasswordResetCode).toHaveBeenCalledWith('juan@example.com')
      })
      expect(screen.getByRole('status')).toHaveTextContent(
        'Te hemos enviado un código nuevo.',
      )
    })

    it('debe volver al paso 1 con «Cambiar el correo»', async () => {
      await goToStep2()

      await userEvent.click(
        screen.getByRole('button', { name: /cambiar el correo/i }),
      )

      expect(
        screen.getByRole('heading', { name: /recuperar la contraseña/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /enviar el código/i }),
      ).toBeInTheDocument()
    })
  })
})
