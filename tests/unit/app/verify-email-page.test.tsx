/**
 * Tests - Página de verificación de email (/verify-email)
 * Verifica que la página existe y muestra el formulario de verificación.
 */
import { render, screen } from '@testing-library/react'
import VerifyEmailPage from '@/app/(unauth)/verify-email/page'
import { useRouter, useSearchParams } from 'next/navigation'

jest.mock('@/features/auth/services/auth-service', () => ({
  verifyEmail: jest.fn(),
  resendVerificationCode: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

describe('Página de verificación de email', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })
    ;(useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('email=test@example.com'),
    )
  })

  it('muestra el título y el formulario de verificación', () => {
    render(<VerifyEmailPage />)

    expect(
      screen.getByRole('heading', { name: /verifica tu correo/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue(
      'test@example.com',
    )
    expect(
      screen.getByLabelText(/código de verificación/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /verificar correo/i }),
    ).toBeInTheDocument()
  })
})
