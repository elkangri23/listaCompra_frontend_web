export interface AuthUser {
  id: string
  name: string
  email: string
  roles: string[]
  image?: string | null
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface AuthResponse {
  user: AuthUser
  tokens: AuthTokens
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface RefreshTokenRequest {
  refreshToken?: string
}
