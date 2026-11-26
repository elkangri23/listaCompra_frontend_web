/**
 * Tests unitarios - mfaStepSchema (paso 2 del login dos fases)
 */

import { mfaStepSchema } from '@/features/auth/validators/schemas'

describe('mfaStepSchema', () => {
  const UUID = '11111111-2222-3333-4444-555555555555'

  it('acepta challengeId + code de 6 dígitos', () => {
    const result = mfaStepSchema.safeParse({
      challengeId: UUID,
      code: '123456',
    })
    expect(result.success).toBe(true)
  })

  it('acepta challengeId + backupCode', () => {
    const result = mfaStepSchema.safeParse({
      challengeId: UUID,
      backupCode: 'A3F9K2M7',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza code y backupCode a la vez', () => {
    const result = mfaStepSchema.safeParse({
      challengeId: UUID,
      code: '123456',
      backupCode: 'A3F9K2M7',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza sin ninguno de los dos', () => {
    const result = mfaStepSchema.safeParse({ challengeId: UUID })
    expect(result.success).toBe(false)
  })

  it('rechaza code no numérico o de longitud incorrecta', () => {
    expect(
      mfaStepSchema.safeParse({ challengeId: UUID, code: '12345' }).success,
    ).toBe(false)
    expect(
      mfaStepSchema.safeParse({ challengeId: UUID, code: 'abcdef' }).success,
    ).toBe(false)
    expect(
      mfaStepSchema.safeParse({ challengeId: UUID, code: '1234567' }).success,
    ).toBe(false)
  })

  it('rechaza challengeId no UUID', () => {
    const result = mfaStepSchema.safeParse({
      challengeId: 'no-es-uuid',
      code: '123456',
    })
    expect(result.success).toBe(false)
  })
})
