import NextAuth, { type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { login, refreshToken } from '@/features/auth/services/auth-service'
import { loginSchema } from '@/features/auth/validators/schemas'

// Helper to decode JWT without external libraries
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    // Use Buffer for robust Base64 decoding in Node.js environment
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('Failed to decode JWT:', e)
    return null
  }
}

const callbacks: NextAuthConfig['callbacks'] = {
  async jwt({ token, user }) {
    // Initial sign-in
    if (user && user.token) {
      const decoded = decodeJwt(user.token as string)
      if (!decoded) return { ...token, error: 'InvalidTokenError' }

      token.accessToken = user.token
      token.expiresAt = decoded.exp * 1000 // exp is in seconds
      token.user = {
        id: decoded.sub, // Assuming 'sub' is the user ID
        email: decoded.email,
        name: decoded.name,
        roles: decoded.roles ?? [],
      }
      return token
    }

    // Return previous token if it has not expired yet
    // if (Date.now() < (token.expiresAt as number)) {
    //   return token
    // }

    // // Expired token, try to refresh it
    // try {
    //   const refreshed = await refreshToken({
    //     refreshToken: token.accessToken as string, // Using the expired token as the refresh token
    //   })

    //   const decoded = decodeJwt(refreshed.token)
    //   if (!decoded) return { ...token, error: 'InvalidTokenError' }

    //   token.accessToken = refreshed.token
    //   token.expiresAt = decoded.exp * 1000
    //   // User info should persist from the original token, but we can re-set it
    //   token.user = {
    //     id: decoded.sub,
    //     email: decoded.email,
    //     name: decoded.name,
    //     roles: decoded.roles ?? [],
    //   }
    //   // Clear any previous error
    //   delete token.error

    // } catch (error) {
    //   console.error('RefreshAccessTokenError', error)
    //   token.error = 'RefreshAccessTokenError'
    // }

    return token
  },
  async session({ session, token }) {
    if (token.user) {
      session.user = token.user as any
    }
    if (token.accessToken) {
      session.accessToken = token.accessToken as string
    }
    if (token.error) {
      session.error = token.error as string
    }
    return session
  },
}

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
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
          // The user object passed to the jwt callback
          return {
            token: authResponse.token,
          }
        } catch (error) {
          console.error('Authorize error:', error)
          return null // Returning null triggers a failed login
        }
      },
    }),
  ],
  callbacks,
}

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig)
