'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import {
  resendVerificationCode,
  verifyEmail,
} from '@/features/auth/services/auth-service'

const CODE_PATTERN = /^\d{6}$/

/**
 * Formulario de verificación de email por código (item 3).
 * Tras el registro o un login sin verificar, el usuario llega aquí con
 * ?email= y mete el código de 6 dígitos que le llegó por correo.
 */
export function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') ?? ''
  // sent=0: el registro no pudo enviar el correo con el código
  const emailNotSent = searchParams.get('sent') === '0'

  const [email, setEmail] = React.useState(initialEmail)
  const [codigo, setCodigo] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [statusMessage, setStatusMessage] = React.useState<string | null>(
    null,
  )
  const [verified, setVerified] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [isResending, startResendTransition] = React.useTransition()

  const handleSubmit = React.useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      setErrorMessage(null)
      setStatusMessage(null)

      const cleanCode = codigo.replace(/[\s-]/g, '')
      if (!email.trim()) {
        setErrorMessage('Escribe el correo de tu cuenta.')
        return
      }
      if (!CODE_PATTERN.test(cleanCode)) {
        setErrorMessage('El código tiene 6 dígitos.')
        return
      }

      startTransition(async () => {
        try {
          const result = await verifyEmail({
            email: email.trim(),
            codigo: cleanCode,
          })
          setVerified(true)
          setStatusMessage(result.mensaje)
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'No se pudo verificar el correo.'
          setErrorMessage(message)
        }
      })
    },
    [codigo, email],
  )

  const handleResend = React.useCallback(() => {
    setErrorMessage(null)
    setStatusMessage(null)
    if (!email.trim()) {
      setErrorMessage('Escribe el correo de tu cuenta para reenviar el código.')
      return
    }
    startResendTransition(async () => {
      try {
        const result = await resendVerificationCode(email.trim())
        setStatusMessage(result.mensaje)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo reenviar el código.'
        setErrorMessage(message)
      }
    })
  }, [email])

  if (verified) {
    return (
      <div className="mt-8 px-4">
        <div className="rounded-lg bg-[#e8f7ee] p-4">
          <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
            Correo verificado
          </h2>
          <p className="text-sm text-[#111418]">
            {statusMessage ?? 'Tu correo ha sido verificado. Ya puedes entrar.'}
          </p>
        </div>
        <div className="flex px-4 py-3 mt-6">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#4387f4] text-white text-sm font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Ir a iniciar sesión</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="mt-8 px-4">
        <h2 className="text-[#111418] text-lg font-bold leading-normal mb-4">
          Verifica tu correo
        </h2>
        <p className="text-sm text-[#60708a] mb-4">
          Te hemos enviado un código de 6 dígitos. Caduca en 15 minutos y
          solo sirve una vez.
        </p>

        {emailNotSent ? (
          <div
            role="alert"
            className="rounded-lg bg-[#fff4e0] p-4 mb-4 text-sm text-[#111418]"
          >
            No pudimos enviarte el correo con el código. Pide uno nuevo con
            el botón de abajo.
          </div>
        ) : null}

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
          <label
            htmlFor="verify-email"
            className="flex flex-col min-w-40 flex-1"
          >
            <span className="text-sm font-medium text-[#111418] mb-2">
              Correo electrónico
            </span>
            <input
              id="verify-email"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              name="email"
              type="email"
              autoComplete="email"
            />
          </label>
        </div>

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
          <label
            htmlFor="verify-code"
            className="flex flex-col min-w-40 flex-1"
          >
            <span className="text-sm font-medium text-[#111418] mb-2">
              Código de verificación
            </span>
            <input
              id="verify-code"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal tracking-[0.5em]"
              placeholder="123456"
              value={codigo}
              onChange={(event) =>
                setCodigo(event.target.value.replace(/[^\d\s-]/g, ''))
              }
              name="codigo"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
            />
          </label>
        </div>

        {errorMessage ? (
          <p role="alert" className="text-sm text-red-600 px-4">
            {errorMessage}
          </p>
        ) : null}
        {statusMessage ? (
          <p role="status" className="text-sm text-[#111418] px-4">
            {statusMessage}
          </p>
        ) : null}

        <div className="flex px-4 py-3 mt-6">
          <button
            type="submit"
            disabled={isPending}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#4387f4] text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 disabled:opacity-60"
          >
            <span className="truncate">
              {isPending ? 'Verificando…' : 'Verificar correo'}
            </span>
          </button>
        </div>

        <div className="flex px-4 py-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#f0f2f5] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-60"
          >
            <span className="truncate">
              {isResending ? 'Enviando…' : 'Reenviar el código'}
            </span>
          </button>
        </div>

        <p className="text-sm text-[#60708a] px-4 py-3">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </form>
  )
}
