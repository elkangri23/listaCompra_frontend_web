import type { DefaultSession } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    error?: string
    user: DefaultSession['user'] & {
      id: string
      roles: string[]
    }
  }

  interface User {
    roles?: string[]
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    error?: string
    user?: {
      id: string
      email: string
      name: string
      image?: string
      roles: string[]
    }
  }
}
