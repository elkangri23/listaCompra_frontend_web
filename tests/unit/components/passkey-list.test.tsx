/**
 * Tests unitarios - passkey-list.tsx (/profile Seguridad, CU-MFA fase 2)
 * Mockea @simplewebauthn/browser y el servicio.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  browserSupportsWebAuthn,
  listPasskeys,
  passkeyRegisterOptions,
  passkeyRegisterVerify,
  renamePasskey,
  deletePasskey,
} from '@/features/auth/services/passkey-service'
import { startRegistration } from '@simplewebauthn/browser'
import { PasskeyList } from '@/features/settings/components/passkey-list'

jest.mock('@/features/auth/services/passkey-service', () => ({
  listPasskeys: jest.fn(),
  passkeyRegisterOptions: jest.fn(),
  passkeyRegisterVerify: jest.fn(),
  renamePasskey: jest.fn(),
  deletePasskey: jest.fn(),
  browserSupportsWebAuthn: jest.fn(() => true),
}))

jest.mock('@simplewebauthn/browser', () => ({
  startRegistration: jest.fn(),
}))

const mockPasskey = {
  id: 'pk-1',
  nombre: 'MacBook de Ana',
  deviceType: 'multiDevice',
  transports: ['internal'],
  createdAt: '2026-11-30T10:00:00Z',
  ultimoUso: null,
  activo: true,
}

const mocked = {
  listPasskeys: listPasskeys as jest.Mock,
  passkeyRegisterOptions: passkeyRegisterOptions as jest.Mock,
  passkeyRegisterVerify: passkeyRegisterVerify as jest.Mock,
  renamePasskey: renamePasskey as jest.Mock,
  deletePasskey: deletePasskey as jest.Mock,
  startRegistration: startRegistration as jest.Mock,
}

describe('PasskeyList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // clearAllMocks conserva implementaciones: re-fija el default "soportado"
    ;(browserSupportsWebAuthn as jest.Mock).mockReturnValue(true)
  })

  it('renderiza las passkeys cargadas', async () => {
    mocked.listPasskeys.mockResolvedValue([mockPasskey])
    render(<PasskeyList />)
    await waitFor(() =>
      expect(screen.getByText('MacBook de Ana')).toBeInTheDocument(),
    )
    expect(screen.getByText(/Sincronizada/)).toBeInTheDocument()
  })

  it('muestra nota si el navegador no soporta WebAuthn y deshabilita añadir', async () => {
    ;(browserSupportsWebAuthn as jest.Mock).mockReturnValue(false)
    mocked.listPasskeys.mockResolvedValue([])
    render(<PasskeyList />)
    expect(screen.getByText(/no soporta passkeys/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Añadir passkey' }),
    ).toBeDisabled()
  })

  it('flujo de registro feliz: password → options → attestation → verify', async () => {
    mocked.listPasskeys.mockResolvedValue([mockPasskey])
    mocked.passkeyRegisterOptions.mockResolvedValue({
      challengeId: 'ch-1',
      options: {},
    })
    mocked.startRegistration.mockResolvedValue({ id: 'cred', response: {} })
    mocked.passkeyRegisterVerify.mockResolvedValue({
      passkeyId: 'pk-2',
      nombre: 'Passkey',
    })

    const user = userEvent.setup()
    render(<PasskeyList />)
    await waitFor(() =>
      expect(screen.getByText('MacBook de Ana')).toBeInTheDocument(),
    )

    await user.click(screen.getByRole('button', { name: 'Añadir passkey' }))
    await user.type(screen.getByLabelText('Contraseña actual'), 'Password1!')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() =>
      expect(mocked.passkeyRegisterVerify).toHaveBeenCalledWith({
        password: 'Password1!',
        challengeId: 'ch-1',
        credential: { id: 'cred', response: {} },
      }),
    )
  })

  it('deshabilita añadir al tope de 5 con tooltip', async () => {
    mocked.listPasskeys.mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => ({ ...mockPasskey, id: `pk-${i}` })),
    )
    render(<PasskeyList />)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Añadir passkey' }),
      ).toBeDisabled(),
    )
    expect(
      screen.getByRole('button', { name: 'Añadir passkey' }),
    ).toHaveAttribute('title', expect.stringContaining('Máximo'))
  })

  it('renombrar inline llama a renamePasskey', async () => {
    mocked.listPasskeys.mockResolvedValue([mockPasskey])
    mocked.renamePasskey.mockResolvedValue({
      ...mockPasskey,
      nombre: 'Portátil',
    })

    const user = userEvent.setup()
    render(<PasskeyList />)
    await waitFor(() =>
      expect(screen.getByText('MacBook de Ana')).toBeInTheDocument(),
    )

    await user.click(
      screen.getByRole('button', { name: 'Renombrar MacBook de Ana' }),
    )
    const input = screen.getByLabelText(/nuevo nombre/i)
    await user.clear(input)
    await user.type(input, 'Portátil{Enter}')

    await waitFor(() =>
      expect(mocked.renamePasskey).toHaveBeenCalledWith('pk-1', 'Portátil'),
    )
    await waitFor(() =>
      expect(screen.getByText('Portátil')).toBeInTheDocument(),
    )
  })

  it('eliminar exige contraseña y llama a deletePasskey', async () => {
    mocked.listPasskeys.mockResolvedValue([mockPasskey])
    mocked.deletePasskey.mockResolvedValue({ deleted: true })

    const user = userEvent.setup()
    render(<PasskeyList />)
    await waitFor(() =>
      expect(screen.getByText('MacBook de Ana')).toBeInTheDocument(),
    )

    await user.click(
      screen.getByRole('button', { name: 'Eliminar MacBook de Ana' }),
    )
    expect(screen.getByText(/Eliminar «MacBook de Ana»/)).toBeInTheDocument()

    await user.type(
      screen.getByLabelText(/introduce tu contraseña/i),
      'Password1!',
    )
    await user.click(
      screen.getByRole('button', { name: 'Eliminar definitivamente' }),
    )

    await waitFor(() =>
      expect(mocked.deletePasskey).toHaveBeenCalledWith('pk-1', 'Password1!'),
    )
  })
})
