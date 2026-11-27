import type { DefaultSession } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import type { ApiLoginResponse } from '@/features/auth/types'

declare module 'next-auth' {
  /**
   * The shape of the user object returned in the session.
   */
  interface Session {
    accessToken?: string
    error?: string
    /** true en el estado intermedio: el login necesita el paso MFA */
    mfaRequired?: boolean
        challengeId?: string
    /** true en el estado intermedio: la cuenta necesita verificar el correo (item 3) */
    emailNotVerified?: boolean
    user: DefaultSession['user'] & {
      id: string
      roles: string[]
    }
  }

  /**
   * The shape of the user object returned from the authorize callback.
   */
  interface User {
    token?: string
    refreshToken?: string
    user?: ApiLoginResponse['data']['user']
    /** Token intermedio del paso 1 cuando el usuario tiene TOTP activo */
    mfaPending?: boolean
    challengeId?: string
    /** Token intermedio del paso 1 cuando la cuenta no tiene el correo verificado (item 3) */
    emailNotVerified?: boolean
    email?: string
  }
}

declare module 'next-auth/jwt' {
  /**
   * The shape of the JWT that is dealt with internally.
   */
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    error?: string
    /** Estado intermedio: el login necesita el paso MFA */
    mfaPending?: boolean
    mfaExp?: number
    challengeId?: string
    /** Estado intermedio: la cuenta necesita verificar el correo (item 3) */
    emailNotVerified?: boolean
    emailNotVerifiedExp?: number
    email?: string
    user?: {
      id: string
      email: string
      name: string
      roles: string[]
    }
  }
}
