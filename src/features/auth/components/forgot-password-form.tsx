'use client'

import Link from 'next/link'
import * as React from 'react'

import {
  requestPasswordReset,
  resetPassword,
  resendPasswordResetCode,
} from '@/features/auth/services/auth-service'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordSchema,
  type ResetPasswordSchema,
} from '@/features/auth/validators/schemas'

type ForgotPasswordFieldErrors = Partial<Record<keyof ForgotPasswordSchema, string>>
type ResetPasswordFieldErrors = Partial<Record<keyof ResetPasswordSchema, string>>

type FormEvent = React.FormEvent<HTMLFormElement>

type ChangeEvent = React.ChangeEvent<HTMLInputElement>

const CODE_PATTERN = /^\d{6}$/

/**
 * Restablecer la contraseña por código (item 9c).
 * Paso 1: el correo, al que llega un código de 6 dígitos.
 * Paso 2: el código + la contraseña nueva (dos veces).
 */
export function ForgotPasswordForm() {
  const [step, setStep] = React.useState<1 | 2>(1)
  const [email, setEmail] = React.useState('')
  const [codigo, setCodigo] = React.useState('')
  const [nuevaPassword, setNuevaPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState<
    ForgotPasswordFieldErrors & ResetPasswordFieldErrors
  >({})
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [isResending, startResendTransition] = React.useTransition()

  const clearFieldError = React.useCallback((name: string) => {
    setFieldErrors((previous) => {
      if (!previous[name as keyof typeof previous]) {
        return previous
      }
      return { ...previous, [name]: undefined }
    })
  }, [])

  const handleEmailSubmit = React.useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      setErrorMessage(null)
      setStatusMessage(null)

      const validation = forgotPasswordSchema.safeParse({ email })
      if (!validation.success) {
        const zodErrors = validation.error.flatten().fieldErrors
        const nextErrors: ForgotPasswordFieldErrors = {}
        Object.entries(zodErrors).forEach(([key, messages]) => {
          nextErrors[key as keyof ForgotPasswordSchema] = messages[0]
        })
        setFieldErrors(nextErrors)
        return
      }

      setFieldErrors({})
      const formData = validation.data

      startTransition(async () => {
        try {
          await requestPasswordReset({ email: formData.email })
          setStatusMessage(
            `Te hemos enviado un código de 6 dígitos a ${formData.email}.`,
          )
          setStep(2)
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'No se pudo enviar el código de recuperación.'
          setErrorMessage(message)
        }
      })
    },
    [email],
  )

  const handleResetSubmit = React.useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      setErrorMessage(null)
      setStatusMessage(null)

      const cleanCode = codigo.replace(/[\s-]/g, '')
      const validation = resetPasswordSchema.safeParse({
        codigo: cleanCode,
        nuevaPassword,
        confirmPassword,
      })
      if (!validation.success) {
        const zodErrors = validation.error.flatten().fieldErrors
        const nextErrors: ResetPasswordFieldErrors = {}
        Object.entries(zodErrors).forEach(([key, messages]) => {
          nextErrors[key as keyof ResetPasswordSchema] = messages[0]
        })
        setFieldErrors(nextErrors)
        return
      }

      setFieldErrors({})
      const formData = validation.data

      startTransition(async () => {
        try {
          const result = await resetPassword({
            email,
            codigo: formData.codigo,
            nuevaPassword: formData.nuevaPassword,
          })
          setDone(true)
          setStatusMessage(result.mensaje)
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'No se pudo cambiar la contraseña. Inténtalo nuevamente.'
          setErrorMessage(message)
        }
      })
    },
    [codigo, confirmPassword, email, nuevaPassword],
  )

  const handleResend = React.useCallback(() => {
    setErrorMessage(null)
    setStatusMessage(null)
    startResendTransition(async () => {
      try {
        await resendPasswordResetCode(email)
        setStatusMessage('Te hemos enviado un código nuevo.')
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo reenviar el código. Inténtalo nuevamente.'
        setErrorMessage(message)
      }
    })
  }, [email])

  const handleCodeChange = React.useCallback(
    (event: ChangeEvent) => {
      setCodigo(event.target.value.replace(/[^\d\s-]/g, ''))
      clearFieldError('codigo')
    },
    [clearFieldError],
  )

  if (done) {
    return (
      <div className="px-4 mt-8">
        <h2 className="text-[#111418] text-lg font-bold leading-normal mb-4">
          Contraseña cambiada
        </h2>
        {statusMessage ? (
          <p role="status" className="text-sm text-emerald-600 py-2">
            {statusMessage}
          </p>
        ) : null}
        <div className="flex py-3 mt-6">
          <Link
            href="/login"
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 w-full bg-[#4387f4] text-white text-sm font-bold leading-normal tracking-[0.015em]"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <form noValidate onSubmit={handleResetSubmit} className="px-4 mt-8">
        <h2 className="text-[#111418] text-lg font-bold leading-normal mb-4">
          Pon tu contraseña nueva
        </h2>

        <div className="flex flex-col max-w-[480px] py-3">
          <label htmlFor="codigo" className="flex flex-col">
            <span className="text-sm font-medium text-[#111418] mb-2">
              Código de 6 dígitos
            </span>
            <input
              id="codigo"
              name="codigo"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              value={codigo}
              onChange={handleCodeChange}
              aria-invalid={fieldErrors.codigo ? 'true' : 'false'}
              aria-describedby={fieldErrors.codigo ? 'codigo-error' : undefined}
              className="flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal tracking-[0.5em]"
            />
          </label>
          {fieldErrors.codigo ? (
            <p id="codigo-error" role="alert" className="text-sm text-red-600 mt-2">
              {fieldErrors.codigo}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col max-w-[480px] py-3">
          <label htmlFor="nuevaPassword" className="flex flex-col">
            <span className="text-sm font-medium text-[#111418] mb-2">
              Contraseña nueva
            </span>
            <input
              id="nuevaPassword"
              name="nuevaPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={nuevaPassword}
              onChange={(event) => {
                setNuevaPassword(event.target.value)
                clearFieldError('nuevaPassword')
              }}
              aria-invalid={fieldErrors.nuevaPassword ? 'true' : 'false'}
              aria-describedby={
                fieldErrors.nuevaPassword ? 'nuevaPassword-error' : undefined
              }
              className="flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal"
            />
          </label>
          {fieldErrors.nuevaPassword ? (
            <p id="nuevaPassword-error" role="alert" className="text-sm text-red-600 mt-2">
              {fieldErrors.nuevaPassword}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col max-w-[480px] py-3">
          <label htmlFor="confirmPassword" className="flex flex-col">
            <span className="text-sm font-medium text-[#111418] mb-2">
              Repite la contraseña nueva
            </span>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Vuelve a escribirla"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                clearFieldError('confirmPassword')
              }}
              aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
              aria-describedby={
                fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined
              }
              className="flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal"
            />
          </label>
          {fieldErrors.confirmPassword ? (
            <p id="confirmPassword-error" role="alert" className="text-sm text-red-600 mt-2">
              {fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>

        {errorMessage ? (
          <p role="alert" className="text-sm text-red-600 py-2">
            {errorMessage}
          </p>
        ) : null}

        {statusMessage ? (
          <p role="status" className="text-sm text-emerald-600 py-2">
            {statusMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 py-3 mt-6">
          <button
            type="submit"
            disabled={isPending}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 w-full bg-[#4387f4] text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 disabled:opacity-60"
          >
            {isPending ? 'Cambiando la contraseña…' : 'Cambiar la contraseña'}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || isPending}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 w-full border border-[#dbdfe6] bg-white text-[#111418] text-sm font-bold hover:bg-[#f0f2f5] disabled:opacity-60"
          >
            {isResending ? 'Reenviando…' : 'Reenviar el código'}
          </button>
        </div>

        <p className="text-[#60708a] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center w-full max-w-[480px]">
          <button
            type="button"
            onClick={() => {
              setStep(1)
              setErrorMessage(null)
              setStatusMessage(null)
            }}
            className="underline"
          >
            Cambiar el correo
          </button>
        </p>
      </form>
    )
  }

  return (
    <form noValidate onSubmit={handleEmailSubmit} className="px-4 mt-8">
      <h2 className="text-[#111418] text-lg font-bold leading-normal mb-4">
        Recuperar la contraseña
      </h2>
      <p className="text-[#60708a] text-sm font-normal leading-normal mb-2 max-w-[480px]">
        Te enviaremos un código de 6 dígitos para poner una contraseña nueva.
      </p>

      <div className="flex flex-col max-w-[480px] py-3">
        <label htmlFor="email" className="flex flex-col">
          <span className="text-sm font-medium text-[#111418] mb-2">Correo electrónico</span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              clearFieldError('email')
            }}
            aria-invalid={fieldErrors.email ? 'true' : 'false'}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            className="flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal"
          />
        </label>
        {fieldErrors.email ? (
          <p id="email-error" role="alert" className="text-sm text-red-600 mt-2">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      {errorMessage ? (
        <p role="alert" className="text-sm text-red-600 py-2">
          {errorMessage}
        </p>
      ) : null}

      {statusMessage ? (
        <p role="status" className="text-sm text-emerald-600 py-2">
          {statusMessage}
        </p>
      ) : null}

      <div className="flex py-3 mt-6">
        <button
          type="submit"
          disabled={isPending}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 w-full bg-[#4387f4] text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 disabled:opacity-60"
        >
          {isPending && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>{isPending ? 'Enviando el código…' : 'Enviar el código'}</span>
        </button>
      </div>

      <div>
        <p>
          ¿Recordaste tu contraseña?{' '}
          <Link href="/login">
            Inicia sesión
          </Link>
        </p>
        <p>
          ¿No tienes cuenta?{' '}
          <Link href="/register">
            Regístrate
          </Link>
        </p>
      </div>
    </form>
  )
}
