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
