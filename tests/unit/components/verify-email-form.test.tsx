/**
 * Tests CRÍTICOS (100% coverage) - verify-email-form.tsx
 * Formulario de verificación de email por código (item 3)
 *
 * Patrón: Arrange-Act-Assert
 * Testing Library: @testing-library/react
 * Mock: auth-service, next/navigation router + searchParams
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import { VerifyEmailForm } from '@/features/auth/components/verify-email-form'
import {
  verifyEmail,
  resendVerificationCode,
} from '@/features/auth/services/auth-service'

jest.mock('@/features/auth/services/auth-service', () => ({
  verifyEmail: jest.fn(),
  resendVerificationCode: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

describe('VerifyEmailForm (CRÍTICO - 100% coverage)', () => {
  const mockPush = jest.fn()
  let searchParams = new URLSearchParams('email=test@example.com')

  beforeEach(() => {
    jest.clearAllMocks()
    searchParams = new URLSearchParams('email=test@example.com')
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(useSearchParams as jest.Mock).mockImplementation(() => searchParams)
  })

  describe('Renderizado inicial', () => {
    it('debe renderizar el correo prellenado, el código y los botones', () => {
      render(<VerifyEmailForm />)

      expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue(
        'test@example.com',
      )
      expect(screen.getByLabelText(/código de verificación/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /verificar correo/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /reenviar el código/i }),
      ).toBeInTheDocument()
    })

    it('debe avisar cuando el registro no pudo enviar el correo (sent=0)', () => {
      searchParams = new URLSearchParams('email=test@example.com&sent=0')
      render(<VerifyEmailForm />)

      expect(
        screen.getByText(/no pudimos enviarte el correo/i),
      ).toBeInTheDocument()
    })

    it('debe mostrar enlace a login', () => {
      render(<VerifyEmailForm />)

      const loginLink = screen.getByRole('link', { name: /inicia sesión/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
    })
  })

  describe('Verificación', () => {
    it('debe rechazar un código con menos de 6 dígitos sin llamar al servicio', async () => {
      render(<VerifyEmailForm />)

      await userEvent.type(
        screen.getByLabelText(/código de verificación/i),
        '123',
      )
      fireEvent.submit(screen.getByRole('button', { name: /verificar correo/i }))

      expect(screen.getByRole('alert')).toHaveTextContent(
        'El código tiene 6 dígitos.',
      )
      expect(verifyEmail).not.toHaveBeenCalled()
    })

    it('debe rechazar el envío sin correo', async () => {
      searchParams = new URLSearchParams('')
      render(<VerifyEmailForm />)

      await userEvent.type(
        screen.getByLabelText(/código de verificación/i),
        '482913',
      )
      fireEvent.submit(screen.getByRole('button', { name: /verificar correo/i }))

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Escribe el correo de tu cuenta.',
      )
      expect(verifyEmail).not.toHaveBeenCalled()
    })

    it('debe verificar el código y mostrar el panel de éxito', async () => {
      ;(verifyEmail as jest.Mock).mockResolvedValue({
        emailVerificado: true,
        mensaje: 'Tu correo ha sido verificado. Ya puedes entrar.',
      })
      render(<VerifyEmailForm />)

      await userEvent.type(
        screen.getByLabelText(/código de verificación/i),
        '482913',
      )
      await userEvent.click(
        screen.getByRole('button', { name: /verificar correo/i }),
      )

      await waitFor(() => {
        expect(verifyEmail).toHaveBeenCalledWith({
          email: 'test@example.com',
          codigo: '482913',
        })
      })
      expect(
        screen.getByRole('heading', { name: /correo verificado/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/tu correo ha sido verificado/i),
      ).toBeInTheDocument()

      await userEvent.click(
        screen.getByRole('button', { name: /ir a iniciar sesión/i }),
      )
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('debe mostrar el texto genérico cuando el backend no devuelve mensaje', async () => {
      ;(verifyEmail as jest.Mock).mockResolvedValue({
        emailVerificado: true,
        mensaje: undefined,
      })
      render(<VerifyEmailForm />)

      await userEvent.type(
        screen.getByLabelText(/código de verificación/i),
        '482913',
      )
      await userEvent.click(
        screen.getByRole('button', { name: /verificar correo/i }),
      )

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /correo verificado/i }),
        ).toBeInTheDocument()
      })
      expect(
        screen.getByText(/tu correo ha sido verificado\. ya puedes entrar\./i),
      ).toBeInTheDocument()
    })

    it('debe mostrar el error del backend cuando el código no es válido', async () => {
      ;(verifyEmail as jest.Mock).mockRejectedValue(
        new Error('El código no es válido o ha caducado.'),
      )
      render(<VerifyEmailForm />)

      await userEvent.type(
        screen.getByLabelText(/código de verificación/i),
        '111111',
      )
      await userEvent.click(
        screen.getByRole('button', { name: /verificar correo/i }),
      )

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'El código no es válido o ha caducado.',
        )
      })
    })

    it('debe mostrar el mensaje genérico cuando el error no es un Error', async () => {
      ;(verifyEmail as jest.Mock).mockRejectedValue('boom')
      render(<VerifyEmailForm />)

      await userEvent.type(
        screen.getByLabelText(/código de verificación/i),
        '111111',
      )
      await userEvent.click(
        screen.getByRole('button', { name: /verificar correo/i }),
      )

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'No se pudo verificar el correo.',
        )
      })
    })
  })

  describe('Reenvío', () => {
    it('debe reenviar el código y mostrar el mensaje del backend', async () => {
      ;(resendVerificationCode as jest.Mock).mockResolvedValue({
        emailSent: true,
        mensaje: 'Te hemos enviado un código de 6 dígitos a tu correo.',
      })
      render(<VerifyEmailForm />)

      await userEvent.click(
        screen.getByRole('button', { name: /reenviar el código/i }),
      )

      await waitFor(() => {
        expect(resendVerificationCode).toHaveBeenCalledWith('test@example.com')
      })
      expect(screen.getByRole('status')).toHaveTextContent(
        'Te hemos enviado un código de 6 dígitos a tu correo.',
      )
    })

    it('debe rechazar el reenvío sin correo', async () => {
      searchParams = new URLSearchParams('')
      render(<VerifyEmailForm />)

      await userEvent.click(
        screen.getByRole('button', { name: /reenviar el código/i }),
      )

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Escribe el correo de tu cuenta para reenviar el código.',
      )
      expect(resendVerificationCode).not.toHaveBeenCalled()
    })

    it('debe mostrar el error del backend al reenviar', async () => {
      ;(resendVerificationCode as jest.Mock).mockRejectedValue(
        new Error('Espera un minuto antes de pedir otro código.'),
      )
      render(<VerifyEmailForm />)

      await userEvent.click(
        screen.getByRole('button', { name: /reenviar el código/i }),
      )

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Espera un minuto antes de pedir otro código.',
        )
      })
    })

    it('debe mostrar el mensaje genérico cuando el error de reenvío no es un Error', async () => {
      ;(resendVerificationCode as jest.Mock).mockRejectedValue('boom')
      render(<VerifyEmailForm />)

      await userEvent.click(
        screen.getByRole('button', { name: /reenviar el código/i }),
      )

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'No se pudo reenviar el código.',
        )
      })
    })
  })
})
