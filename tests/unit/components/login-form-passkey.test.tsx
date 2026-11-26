/**
 * Tests unitarios - login-form: botón "Entrar con passkey" (CU-MFA fase 2)
 * Mockea @simplewebauthn/browser (jsdom no tiene navigator.credentials).
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { startAuthentication } from '@simplewebauthn/browser'
import { passkeyLoginOptions } from '@/features/auth/services/passkey-service'

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  getSession: jest.fn().mockResolvedValue({}),
  signOut: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock('@simplewebauthn/browser', () => ({
  startAuthentication: jest.fn(),
  startRegistration: jest.fn(),
}))

jest.mock('@/features/auth/services/passkey-service', () => ({
  ...jest.requireActual('@/features/auth/services/passkey-service'),
  passkeyLoginOptions: jest.fn(),
}))

// jsdom no soporta WebAuthn: dárselo activa el botón
function giveWebAuthnSupport() {
  ;(
    window as unknown as { PublicKeyCredential?: unknown }
  ).PublicKeyCredential = class {}
}
function removeWebAuthnSupport() {
  delete (window as unknown as { PublicKeyCredential?: unknown })
    .PublicKeyCredential
}

import { LoginForm } from '@/features/auth/components/login-form'

describe('LoginForm — botón passkey', () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()
  const mockGet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
    ;(useSearchParams as jest.Mock).mockReturnValue({ get: mockGet })
    mockGet.mockReturnValue(null)
  })

  afterEach(() => removeWebAuthnSupport())

  it('NO renderiza el botón en navegadores sin WebAuthn', () => {
    render(<LoginForm />)
    expect(
      screen.queryByRole('button', { name: /entrar con passkey/i }),
    ).not.toBeInTheDocument()
  })

  it('renderiza el botón cuando window.PublicKeyCredential existe', () => {
    giveWebAuthnSupport()
    render(<LoginForm />)
    expect(
      screen.getByRole('button', { name: /iniciar sesión con passkey/i }),
    ).toBeInTheDocument()
  })

  it('flujo completo: options → startAuthentication → signIn(passkey) → redirect', async () => {
    giveWebAuthnSupport()
    passkeyLoginOptions.mockResolvedValueOnce({
      challengeId: 'ch-1',
      options: { rpId: 'localhost', challenge: 'abc' },
    })
    startAuthentication.mockResolvedValueOnce({ id: 'cred', response: {} })
    ;(signIn as jest.Mock).mockResolvedValueOnce({
      error: null,
      url: '/dashboard',
    })
    ;(getSession as jest.Mock).mockResolvedValueOnce({})

    const user = userEvent.setup()
    render(<LoginForm />)
    await user.click(
      screen.getByRole('button', { name: /iniciar sesión con passkey/i }),
    )

    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith(
        'passkey',
        expect.objectContaining({
          challengeId: 'ch-1',
          credential: expect.stringContaining('"id":"cred"'),
        }),
        expect.objectContaining({ redirect: false }),
      ),
    )
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'))
  })

  it('signIn con error → mensaje y no redirect', async () => {
    giveWebAuthnSupport()
    passkeyLoginOptions.mockResolvedValueOnce({
      challengeId: 'ch-1',
      options: {},
    })
    startAuthentication.mockResolvedValueOnce({ id: 'cred' })
    ;(signIn as jest.Mock).mockResolvedValueOnce({ error: 'CredentialsSignin' })

    const user = userEvent.setup()
    render(<LoginForm />)
    await user.click(
      screen.getByRole('button', { name: /iniciar sesión con passkey/i }),
    )

    await waitFor(() =>
      expect(
        screen.getByText('No se pudo completar el acceso con passkey.'),
      ).toBeInTheDocument(),
    )
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('excepción de startAuthentication (usuario cancela) → mensaje amable', async () => {
    giveWebAuthnSupport()
    passkeyLoginOptions.mockResolvedValueOnce({
      challengeId: 'ch-1',
      options: {},
    })
    startAuthentication.mockRejectedValueOnce(new Error('NotAllowedError'))

    const user = userEvent.setup()
    render(<LoginForm />)
    await user.click(
      screen.getByRole('button', { name: /iniciar sesión con passkey/i }),
    )

    await waitFor(() =>
      expect(
        screen.getByText(
          'Acceso con passkey cancelado o fallido. Usa tu contraseña.',
        ),
      ).toBeInTheDocument(),
    )
  })

  it('sesión sigue mfaRequired tras signIn passkey → error sin redirect', async () => {
    giveWebAuthnSupport();
    passkeyLoginOptions.mockResolvedValueOnce({ challengeId: 'ch-1', options: {} });
    startAuthentication.mockResolvedValueOnce({ id: 'cred' });
    (signIn as jest.Mock).mockResolvedValueOnce({ error: null, url: '/dashboard' });
    (getSession as jest.Mock).mockResolvedValueOnce({ mfaRequired: true });

    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole('button', { name: /iniciar sesión con passkey/i }));

    await waitFor(() =>
      expect(screen.getByText('No se pudo completar el acceso con passkey.')).toBeInTheDocument(),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
