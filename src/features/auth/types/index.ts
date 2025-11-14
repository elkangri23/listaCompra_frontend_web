export interface AuthUser {
  id: string
  name: string
  email: string
  roles: string[]
  image?: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

// API Response Types
export interface ApiUser {
  id: string
  email: string
  nombre: string
  apellidos: string
  nombreCompleto: string
  rol: string
  activo: boolean
  emailVerificado: boolean
}

export interface ApiTokens {
  accessToken: string
  refreshToken: string
}

export interface ApiLoginResponse {
  success: boolean
  data: {
    user: ApiUser
    tokens: ApiTokens
  }
  message: string
  timestamp: string
}

export interface RegisterRequest {
  nombre: string
  apellidos: string
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface RefreshTokenRequest {
  refreshToken?: string
}
