/**
 * Tests unitarios - auth-service.login con rama mfaRequired (login dos fases)
 * Regresión: usuario sin TOTP → respuesta idéntica; con TOTP → mfaRequired.
 */

import { login } from '@/features/auth/services/auth-service'
import { axiosInstance } from '@/lib/api/axios-instance'

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    post: jest.fn(),
    defaults: { baseURL: 'http://localhost:3333/api/v1' },
  },
}))

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>

// silencia los console del service durante los tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
})
afterAll(() => {
  ;(console.log as jest.Mock).mockRestore()
  ;(console.error as jest.Mock).mockRestore()
})

const apiUser = {
  id: 'u1',
  email: 'ana@test.es',
  nombre: 'Ana',
  nombreCompleto: 'Ana Test',
  rol: 'USUARIO',
  activo: true,
  emailVerificado: true,
}

describe('auth-service.login — dos fases', () => {
  it('usuario SIN TOTP → respuesta idéntica a antes (token + user)', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      status: 200,
      data: {
        success: true,
        data: {
          user: apiUser,
          tokens: { accessToken: 'at', refreshToken: 'rt' },
        },
        message: 'Autenticación exitosa',
        timestamp: 'x',
      },
    })
    const result = await login({ email: 'ana@test.es', password: 'Password1!' })
    expect(result).toEqual({ token: 'at', refreshToken: 'rt', user: apiUser })
    expect('mfaRequired' in result).toBe(false)
  })

  it('usuario CON TOTP → { mfaRequired: true, challengeId } sin lanzar error', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      status: 200,
      data: {
        success: true,
        data: { mfaRequired: true, mfa: { challengeId: 'ch-123' } },
        message: 'Autenticación exitosa',
        timestamp: 'x',
      },
    })
    const result = await login({ email: 'ana@test.es', password: 'Password1!' })
    expect(result).toEqual({ mfaRequired: true, challengeId: 'ch-123' })
    expect('token' in result).toBe(false)
  })
})
