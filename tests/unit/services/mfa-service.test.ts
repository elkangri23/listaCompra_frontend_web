/**
 * Tests unitarios - mfa-service.ts (CU-MFA fase 1)
 * Contratos de los endpoints MFA y discriminación de los sobres de error
 * (nested de errorMiddleware vs plano de limiters).
 */

import {
  getMfaStatus,
  totpSetup,
  totpVerifyEnable,
  totpDisable,
  mfaLogin,
  MfaApiError,
} from '@/features/auth/services/mfa-service'
import { axiosInstance } from '@/lib/api/axios-instance'

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>

describe('mfa-service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMfaStatus', () => {
    it('devuelve el data del sobre', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            totpEnabled: true,
            totpPending: false,
            passkeyCount: 0,
            backupCodesLeft: 7,
          },
        },
      })
      const status = await getMfaStatus()
      expect(status).toEqual({
        totpEnabled: true,
        totpPending: false,
        passkeyCount: 0,
        backupCodesLeft: 7,
      })
      expect(mockedAxios.get).toHaveBeenCalledWith('/auth/mfa/status')
    })

    it('mapea el error nested a MfaApiError con code', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 500,
          data: {
            success: false,
            error: {
              type: 'MFA_ERROR',
              code: 'MFA_DECRYPT_FAILED',
              message: 'No se pudo descifrar',
            },
          },
        },
      })
      await expect(getMfaStatus()).rejects.toMatchObject({
        name: 'MfaApiError',
        code: 'MFA_DECRYPT_FAILED',
      })
    })
  })

  describe('totpSetup', () => {
    it('envía la contraseña (step-up) y devuelve otpauthUrl + qrDataUrl', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            otpauthUrl: 'otpauth://totp/ListaCompra:a@b.c?secret=XYZ',
            qrDataUrl: 'data:image/png;base64,xx',
          },
        },
      })
      const result = await totpSetup('Password1!')
      expect(result.otpauthUrl).toContain('otpauth://')
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/totp/setup', {
        password: 'Password1!',
      })
    })

    it('error 409 MFA_ALREADY_ENABLED → MfaApiError con code', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 409,
          data: {
            success: false,
            error: {
              type: 'MFA_ERROR',
              code: 'MFA_ALREADY_ENABLED',
              message: 'El TOTP ya está activo',
            },
          },
        },
      })
      await expect(totpSetup('Password1!')).rejects.toMatchObject({
        name: 'MfaApiError',
        code: 'MFA_ALREADY_ENABLED',
      })
    })
  })

  describe('totpVerifyEnable', () => {
    it('devuelve los 10 backup codes', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: { mfaEnabled: true, backupCodes: ['A3F9-K2M7', 'B4G0-L3N8'] },
        },
      })
      const result = await totpVerifyEnable('Password1!', '123456')
      expect(result.backupCodes).toHaveLength(2)
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/auth/totp/verify-enable',
        {
          password: 'Password1!',
          code: '123456',
        },
      )
    })

    it('429 del limiter (sobre plano) → MfaApiError con code RATE_LIMIT_EXCEEDED', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 429,
          data: {
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Demasiados intentos',
            retryAfter: 900,
          },
        },
      })
      await expect(
        totpVerifyEnable('Password1!', '123456'),
      ).rejects.toMatchObject({
        name: 'MfaApiError',
        code: 'RATE_LIMIT_EXCEEDED',
      })
    })
  })

  describe('totpDisable', () => {
    it('envía password + code cuando hay código', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true, data: { mfaEnabled: false } },
      })
      await totpDisable('Password1!', '123456')
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/totp/disable', {
        password: 'Password1!',
        code: '123456',
      })
    })

    it('sin código solo envía password', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { success: true, data: { mfaEnabled: false } },
      })
      await totpDisable('Password1!')
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/totp/disable', {
        password: 'Password1!',
      })
    })
  })

  describe('mfaLogin', () => {
    it('paso 2 con code → tokens del sobre', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            user: { id: 'u1' },
            tokens: { accessToken: 'at', refreshToken: 'rt' },
            mfaInfo: { method: 'TOTP' },
          },
        },
      })
      const result = await mfaLogin('ch-id', { code: '123456' })
      expect(result.token).toBe('at')
      expect(result.refreshToken).toBe('rt')
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login/mfa', {
        challengeId: 'ch-id',
        code: '123456',
      })
    })

    it('paso 2 con backupCode', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            user: { id: 'u1' },
            tokens: { accessToken: 'at', refreshToken: 'rt' },
            mfaInfo: { method: 'BACKUP_CODE', backupUsed: true },
          },
        },
      })
      await mfaLogin('ch-id', { backupCode: 'A3F9-K2M7' })
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login/mfa', {
        challengeId: 'ch-id',
        backupCode: 'A3F9-K2M7',
      })
    })

    it('410 CHALLENGE_EXPIRED → MfaApiError con code y mensaje del backend', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 410,
          data: {
            success: false,
            error: {
              type: 'MFA_ERROR',
              code: 'CHALLENGE_EXPIRED',
              message: 'Vuelve a iniciar sesión',
            },
          },
        },
      })
      await expect(
        mfaLogin('ch-id', { code: '123456' }),
      ).rejects.toBeInstanceOf(MfaApiError)
    })
  })
})
describe('buildMfaError — ramas restantes', () => {
  it('sobre con data pero error no objeto ni string → mensaje del sobre', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 500,
        data: { success: false, message: 'Algo falló' },
      },
    })
    await expect(getMfaStatus()).rejects.toMatchObject({
      message: 'Algo falló',
    })
  })

  it('Error genérico no-axios → su message', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('boom de red'))
    await expect(totpSetup('Password1!')).rejects.toMatchObject({
      message: 'boom de red',
    })
  })

  it('throw de valor no-Error → fallback', async () => {
    mockedAxios.post.mockRejectedValueOnce('falla primitiva')
    await expect(totpDisable('Password1!')).rejects.toMatchObject({
      message: 'No se pudo desactivar el TOTP.',
    })
  })
})
