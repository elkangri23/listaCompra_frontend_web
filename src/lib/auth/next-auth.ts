import NextAuth, { type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { login, refreshToken } from '@/features/auth/services/auth-service'
import { mfaLogin } from '@/features/auth/services/mfa-service'
import { loginSchema, mfaStepSchema } from '@/features/auth/validators/schemas'

// Helper to decode JWT without external libraries
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    // Use Buffer for robust Base64 decoding in Node.js environment
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8')
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('Failed to decode JWT:', e)
    return null
  }
}

const callbacks: NextAuthConfig['callbacks'] = {
  async jwt({ token, user }) {
    // Paso 1 con TOTP activo: token intermedio (mfaPending) — NO contiene accessToken
    if (user && 'mfaPending' in user) {
      return {
        ...token,
        mfaPending: true,
        challengeId: user.challengeId,
        mfaExp: Date.now() + 5 * 60 * 1000,
      }
    }

    // El paso 2 expiró (5 min): Auth.js v5 — devolver token vacío INVALIDA la sesión
    if (
      token.mfaPending &&
      (!token.mfaExp || Date.now() > (token.mfaExp as number))
    ) {
      return {}
    }

    // Initial sign-in (login completo, con o sin TOTP)
    if (user && user.token) {
      const decoded = decodeJwt(user.token as string)
      if (!decoded) return { ...token, error: 'InvalidTokenError' }

      token.accessToken = user.token
      token.expiresAt = decoded.exp * 1000 // exp is in seconds

      // Use data from the API response if available
      if (user.user) {
        token.user = {
          id: user.user.id,
          email: user.user.email,
          name:
            user.user.nombreCompleto ||
            `${user.user.nombre} ${user.user.apellidos}`,
          roles: [user.user.rol],
        }
      } else {
        // Fallback to JWT decoded data
        token.user = {
          id: decoded.userId || decoded.sub,
          email: decoded.email,
          name: decoded.name || decoded.nombreCompleto,
          roles: decoded.role ? [decoded.role] : (decoded.roles ?? []),
        }
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
    // Estado intermedio del login dos pasos (sin accessToken)
    if (token.mfaPending && !token.accessToken) {
      session.mfaRequired = true
    }
    if (token.error) {
      session.error = token.error as string
    }
    return session
  },
}

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  /* Necesario tras proxies/Vercel y para que auth() funcione con next start
     (sin esto, en producción falla con UntrustedHost) */
  trustHost: true,
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
        console.log('--- Authorize Function Start ---')
        console.log('Received credentials:', {
          email: credentials?.email,
          hasChallengeId: 'challengeId' in (credentials ?? {}),
        })

        // PASO 2 del login dos fases: challengeId + code | backupCode
        if (credentials && 'challengeId' in credentials) {
          const mfaParsed = mfaStepSchema.safeParse(credentials)
          if (!mfaParsed.success) {
            console.log('MFA step validation failed')
            return null
          }
          try {
            const result = await mfaLogin(mfaParsed.data.challengeId, {
              ...(mfaParsed.data.code ? { code: mfaParsed.data.code } : {}),
              ...(mfaParsed.data.backupCode
                ? { backupCode: mfaParsed.data.backupCode }
                : {}),
            })
            if (!result.token) return null
            // Sesión normal: el jwt callback entra por la rama user.token
            return { token: result.token, user: result.user as never }
          } catch (error) {
            console.error(
              'MFA step 2 failed:',
              error instanceof Error ? error.message : error,
            )
            return null
          }
        }

        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) {
          console.log('Credential validation failed:', parsed.error.flatten())
          console.log('--- Authorize Function End (Validation Failed) ---')
          return null
        }

        const { email, password } = parsed.data
        console.log('Credentials parsed successfully for email:', email)

        try {
          console.log('Attempting to call login service...')
          const authResponse = await login({ email, password })
          console.log('Login service response:', authResponse)

          // Usuario con TOTP activo: devolver token INTERMEDIO (mfaPending).
          // El jwt callback lo persiste con TTL de 5 min y session.mfaRequired lo expone.
          if ('mfaRequired' in authResponse && authResponse.mfaRequired) {
            console.log('Login requires MFA — returning intermediate token.')
            return { mfaPending: true, challengeId: authResponse.challengeId }
          }

          if (
            !authResponse ||
            !('token' in authResponse) ||
            !authResponse.token
          ) {
            console.log('Authentication response is invalid or missing token.')
            console.log('--- Authorize Function End (Invalid Response) ---')
            return null
          }

          console.log('Authentication successful, token received.')
          console.log('--- Authorize Function End (Success) ---')

          // The user object passed to the jwt callback
          return {
            token: authResponse.token,
            user: authResponse.user,
          }
        } catch (error) {
          console.error(
            'Error during login attempt:',
            JSON.stringify(error, null, 2),
          )
          console.log('--- Authorize Function End (Error) ---')
          return null // Returning null triggers a failed login
        }
      },
    }),
  ],
  callbacks,
}

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig)
