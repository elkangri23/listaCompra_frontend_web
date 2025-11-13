import type { DefaultSession } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  /**
   * The shape of the user object returned in the session.
   */
  interface Session {
    accessToken?: string
    error?: string
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
  }
}

declare module 'next-auth/jwt' {
  /**
   * The shape of the JWT that is dealt with internally.
   */
  interface JWT {
    accessToken?: string
    expiresAt?: number
    error?: string
    user?: {
      id: string
      email: string
      name: string
      roles: string[]
    }
  }
}
