'use client'

import Link from 'next/link'
import * as React from 'react'

import { requestPasswordReset } from '@/features/auth/services/auth-service'
import { forgotPasswordSchema, type ForgotPasswordSchema } from '@/features/auth/validators/schemas'

type ForgotPasswordFieldErrors = Partial<Record<keyof ForgotPasswordSchema, string>>

type FormEvent = React.FormEvent<HTMLFormElement>

type ChangeEvent = React.ChangeEvent<HTMLInputElement>

const initialValues: ForgotPasswordSchema = {
  email: '',
}

export function ForgotPasswordForm() {
  const [values, setValues] = React.useState<ForgotPasswordSchema>(initialValues)
  const [fieldErrors, setFieldErrors] = React.useState<ForgotPasswordFieldErrors>({})
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()

  const handleChange = React.useCallback((event: ChangeEvent) => {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value } as ForgotPasswordSchema))

    setFieldErrors((previous) => {
      if (!previous[name as keyof ForgotPasswordSchema]) {
        return previous
      }
      return { ...previous, [name]: undefined }
    })
  }, [])

  const handleSubmit = React.useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      setErrorMessage(null)
      setStatusMessage(null)

      const validation = forgotPasswordSchema.safeParse(values)
      if (!validation.success) {
        const zodErrors = validation.error.flatten().fieldErrors
        const nextErrors: ForgotPasswordFieldErrors = {}
        const keys = Object.keys(zodErrors) as Array<keyof ForgotPasswordSchema>
        keys.forEach((key) => {
          const message = zodErrors[key]?.[0]
          if (message) {
            nextErrors[key] = message
          }
        })
        setFieldErrors(nextErrors)
        return
      }

      setFieldErrors({})
      const formData = validation.data
      setValues(formData)

      startTransition(async () => {
        try {
          await requestPasswordReset({ email: formData.email })
          setStatusMessage('Si el correo existe en nuestra plataforma, recibirás un enlace para restablecer tu contraseña.')
          setValues({ ...initialValues })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'No se pudo enviar el enlace de recuperación.'
          setErrorMessage(message)
        }
      })
    },
    [values],
  )

  return (
    <form noValidate onSubmit={handleSubmit} className="px-4 mt-8">
      <div className="flex flex-col max-w-[480px] py-3">
        <label htmlFor="email" className="flex flex-col">
          <span className="text-sm font-medium text-[#111418] mb-2">Correo electrónico</span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="usuario@ejemplo.com"
            value={values.email}
            onChange={handleChange}
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
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#4387f4] text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 disabled:opacity-60"
        >
          {isPending && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span className="truncate">{isPending ? 'Enviando enlace…' : 'Enviar instrucciones'}</span>
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
