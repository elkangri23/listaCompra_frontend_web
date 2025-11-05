import NextAuth, { type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { login, refreshAccessToken } from '@/features/auth/services/auth-service'
import { loginSchema } from '@/features/auth/validators/schemas'

const callbacks: NextAuthConfig['callbacks'] = {
  async jwt({ token, user }) {
    if (user) {
      const enrichedUser = user as typeof user & {
        accessToken?: string
        refreshToken?: string
        expiresAt?: number
        roles?: string[]
      }

      token.accessToken = enrichedUser.accessToken
      token.refreshToken = enrichedUser.refreshToken
      token.expiresAt = enrichedUser.expiresAt
      token.user = {
        id: user.id,
        email: user.email!,
        name: user.name ?? '',
        image: user.image ?? undefined,
        roles: enrichedUser.roles ?? [],
      }
      return token
    }

    if (!token.expiresAt || typeof token.expiresAt !== 'number') {
      return token
    }

    const shouldRefresh = Date.now() + 60_000 > token.expiresAt
    if (!shouldRefresh) {
      return token
    }

    try {
      const refreshed = await refreshAccessToken({
        refreshToken: typeof token.refreshToken === 'string' ? token.refreshToken : undefined,
      })

      token.accessToken = refreshed.accessToken
      token.refreshToken = refreshed.refreshToken
      token.expiresAt = refreshed.expiresAt
    } catch (error) {
      token.error = 'RefreshAccessTokenError'
    }

    return token
  },
  async session({ session, token }) {
    if (token.user) {
      session.user = token.user
    }

    if (token.accessToken && typeof token.accessToken === 'string') {
      session.accessToken = token.accessToken
    }

    if (token.error && typeof token.error === 'string') {
      session.error = token.error
    }

    return session
  },
}

export const authConfig: NextAuthConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24, // 1 día
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credenciales',
      credentials: {
        email: { label: 'Correo electrónico', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) {
          return null
        }

        const { email, password } = parsed.data

        try {
          const authResponse = await login({ email, password })

          return {
            id: authResponse.user.id,
            email: authResponse.user.email,
            name: authResponse.user.name,
            image: authResponse.user.image ?? null,
            accessToken: authResponse.tokens.accessToken,
            refreshToken: authResponse.tokens.refreshToken,
            expiresAt: authResponse.tokens.expiresAt,
            roles: authResponse.user.roles,
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'No se pudieron validar las credenciales.'
          throw new Error(message)
        }
      },
    }),
  ],
  callbacks,
  events: {
    async signOut({ token }) {
      if (token?.refreshToken) {
        // In future we can notify backend to revoke refresh token
      }
    },
  },
}

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig)
