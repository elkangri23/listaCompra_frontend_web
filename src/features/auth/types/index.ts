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

/** Respuesta del paso 1 cuando el usuario tiene TOTP activo: NO contiene tokens */
export interface ApiLoginMfaRequiredResponse {
  success: boolean
  data: {
    mfaRequired: true
    mfa: {
      challengeId: string
    }
  }
  message: string
  timestamp: string
}

/** Unión del paso 1: con tokens (sin TOTP), mfaRequired (con TOTP) o emailNotVerified (sin verificar) */
export type LoginStep1Data =
  | ApiLoginResponse['data']
  | ApiLoginMfaRequiredResponse['data']
  | ApiLoginEmailNotVerifiedResponse['data']

/** Respuesta del paso 1 cuando la cuenta no tiene el correo verificado (item 3): NO contiene tokens */
export interface ApiLoginEmailNotVerifiedResponse {
  success: boolean
  data: {
    emailNotVerified: true
    email: string
  }
  message: string
  timestamp: string
}

/** POST /auth/register — la respuesta incluye si el correo con el código se envió (item 3) */
export interface ApiRegisterResponse {
  success: boolean
  data: {
    user: ApiUser & { verificationEmailSent?: boolean }
  }
  message: string
  timestamp: string
}

/** POST /auth/verify-email y POST /auth/resend-verification-code (item 3) */
export interface VerifyEmailRequest {
  email: string
  codigo: string
}

export interface VerifyEmailResponse {
  success: boolean
  data: {
    emailVerificado: boolean
    mensaje: string
  }
  message: string
  timestamp: string
}

export interface ResendVerificationCodeResponse {
  success: boolean
  data: {
    emailSent: boolean
    mensaje: string
  }
  message: string
  timestamp: string
}

/** Resultado del paso 2 (POST /auth/login/mfa) */
export interface ApiMfaLoginResponse {
  success: boolean
  data: {
    user: ApiUser
    tokens: ApiTokens
    mfaInfo: {
      method: 'TOTP' | 'BACKUP_CODE'
      backupUsed?: true
    }
  }
  message: string
  timestamp: string
}

/** GET /auth/mfa/status */
export interface MfaStatus {
  totpEnabled: boolean
  totpPending: boolean
  passkeyCount: number
  backupCodesLeft: number
}

/** POST /auth/totp/setup */
export interface TotpSetupResponse {
  otpauthUrl: string
  qrDataUrl: string
}

/** POST /auth/totp/verify-enable */
export interface TotpVerifyEnableResponse {
  mfaEnabled: true
  backupCodes: string[]
}

export interface RegisterRequest {
  nombre: string
  apellidos: string
  email: string
  password: string
  aceptoTerminos: boolean
  turnstileToken?: string
}

export interface ForgotPasswordRequest {
  email: string
}

/** POST /auth/reset-password (item 9c) */
export interface ResetPasswordRequest {
  email: string
  codigo: string
  nuevaPassword: string
}

export interface ResetPasswordResponse {
  success: boolean
  data: {
    mensaje: string
  }
  message: string
  timestamp: string
}

export interface RefreshTokenRequest {
  refreshToken?: string
}

// ============================================================================
// Passkeys (CU-MFA fase 2)
// ============================================================================

/** GET /auth/passkeys — una credencial del usuario */
export interface PasskeyItem {
  id: string
  nombre: string
  deviceType: string // 'singleDevice' | 'multiDevice'
  transports: string[]
  createdAt: string
  ultimoUso: string | null
  activo: boolean
}

/** POST /auth/passkeys/register-options */
export interface PasskeyRegisterOptionsResponse {
  challengeId: string
  options: Record<string, unknown> // PublicKeyCredentialCreationOptionsJSON
}

/** POST /auth/passkeys/login-options */
export interface PasskeyLoginOptionsResponse {
  challengeId: string
  options: Record<string, unknown> // PublicKeyCredentialRequestOptionsJSON
}
