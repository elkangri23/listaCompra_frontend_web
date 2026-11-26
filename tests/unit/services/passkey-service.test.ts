/**
 * Tests unitarios - passkey-service.ts (CU-MFA fase 2)
 * Contratos de los endpoints /auth/passkeys/* y discriminación de sobres.
 */

import {
  passkeyRegisterOptions,
  passkeyRegisterVerify,
  listPasskeys,
  renamePasskey,
  deletePasskey,
  passkeyLoginOptions,
  passkeyLoginVerify,
  browserSupportsWebAuthn,
} from '@/features/auth/services/passkey-service'
import { axiosInstance } from '@/lib/api/axios-instance'

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>

describe('passkey-service', () => {
  beforeEach(() => jest.clearAllMocks())

  it('passkeyRegisterOptions envía el password (step-up) y devuelve challengeId+options', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { challengeId: 'ch-1', options: { rp: {} } },
      },
    })
    const result = await passkeyRegisterOptions('Password1!')
    expect(result.challengeId).toBe('ch-1')
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/auth/passkeys/register-options',
      {
        password: 'Password1!',
      },
    )
  })

  it('passkeyRegisterVerify envía password + challengeId + credential', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, data: { passkeyId: 'pk-1', nombre: 'Passkey' } },
    })
    const result = await passkeyRegisterVerify({
      password: 'p',
      challengeId: 'ch-1',
      credential: { a: 1 },
    })
    expect(result.passkeyId).toBe('pk-1')
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/auth/passkeys/register-verify',
      {
        password: 'p',
        challengeId: 'ch-1',
        credential: { a: 1 },
      },
    )
  })

  it('listPasskeys devuelve el array del sobre', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { passkeys: [{ id: 'pk-1', nombre: 'Passkey' }] },
      },
    })
    const result = await listPasskeys()
    expect(result).toHaveLength(1)
    expect(mockedAxios.get).toHaveBeenCalledWith('/auth/passkeys')
  })

  it('renamePasskey usa PATCH y devuelve la passkey actualizada', async () => {
    mockedAxios.patch.mockResolvedValueOnce({
      data: {
        success: true,
        data: { passkey: { id: 'pk-1', nombre: 'Nuevo' } },
      },
    })
    const result = await renamePasskey('pk-1', 'Nuevo')
    expect(result.nombre).toBe('Nuevo')
    expect(mockedAxios.patch).toHaveBeenCalledWith('/auth/passkeys/pk-1', {
      nombre: 'Nuevo',
    })
  })

  it('deletePasskey envía password en el body del DELETE', async () => {
    mockedAxios.delete.mockResolvedValueOnce({
      data: { success: true, data: { deleted: true } },
    })
    const result = await deletePasskey('pk-1', 'Password1!')
    expect(result.deleted).toBe(true)
    expect(mockedAxios.delete).toHaveBeenCalledWith('/auth/passkeys/pk-1', {
      data: { password: 'Password1!' },
    })
  })

  it('passkeyLoginOptions es público y devuelve challengeId', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { challengeId: 'ch-9', options: { rpId: 'localhost' } },
      },
    })
    const result = await passkeyLoginOptions()
    expect(result.challengeId).toBe('ch-9')
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/auth/passkeys/login-options',
    )
  })

  it('passkeyLoginVerify devuelve token del accessToken', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          user: { id: 'u1' },
          tokens: { accessToken: 'at', refreshToken: 'rt' },
        },
      },
    })
    const result = await passkeyLoginVerify({
      challengeId: 'ch-1',
      credential: {},
    })
    expect(result.token).toBe('at')
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/auth/passkeys/login-verify',
      {
        challengeId: 'ch-1',
        credential: {},
      },
    )
  })

  it('409 PASSKEY_LIMIT_REACHED → MfaApiError con code', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          success: false,
          error: {
            type: 'MFA_ERROR',
            code: 'PASSKEY_LIMIT_REACHED',
            message: 'Máximo 5 passkeys',
          },
        },
      },
    })
    await expect(passkeyRegisterOptions('p')).rejects.toMatchObject({
      name: 'MfaApiError',
      code: 'PASSKEY_LIMIT_REACHED',
    })
  })

  describe('browserSupportsWebAuthn', () => {
    it('true si window.PublicKeyCredential existe', () => {
      ;(
        window as unknown as { PublicKeyCredential?: unknown }
      ).PublicKeyCredential = class {}
      expect(browserSupportsWebAuthn()).toBe(true)
      delete (window as unknown as { PublicKeyCredential?: unknown })
        .PublicKeyCredential
    })

    it('false en jsdom sin WebAuthn', () => {
      expect(browserSupportsWebAuthn()).toBe(false)
    })
  })
})
