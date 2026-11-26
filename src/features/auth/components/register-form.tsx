'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { registerUser } from '@/features/auth/services/auth-service'
import { TurnstileWidget } from '@/features/auth/components/turnstile-widget'
import { registerSchema, type RegisterSchema } from '@/features/auth/validators/schemas'

type RegisterFieldErrors = Partial<Record<keyof RegisterSchema, string>>

type FormEvent = React.FormEvent<HTMLFormElement>

type ChangeEvent = React.ChangeEvent<HTMLInputElement>

const initialValues: RegisterSchema = {
  nombre: '',
  apellidos: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function RegisterForm() {
  const router = useRouter()
  const [values, setValues] = React.useState<RegisterSchema>(initialValues)
  const [fieldErrors, setFieldErrors] = React.useState<RegisterFieldErrors>({})
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()
  const [termsAccepted, setTermsAccepted] = React.useState(false)
  const [termsError, setTermsError] = React.useState<string | null>(null)
  // Captcha Turnstile (item 14): solo se muestra cuando hay site key
  // configurada; sin ella el registro funciona como hasta ahora.
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null)
  const [turnstileError, setTurnstileError] = React.useState<string | null>(null)

  const handleChange = React.useCallback((event: ChangeEvent) => {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value } as RegisterSchema))

    setFieldErrors((previous) => {
      if (!previous[name as keyof RegisterSchema]) {
        return previous
      }
      return { ...previous, [name]: undefined }
    })
  }, [])

  const handleTermsChange = React.useCallback((event: ChangeEvent) => {
    setTermsAccepted(event.target.checked)
    if (event.target.checked) {
      setTermsError(null)
    }
  }, [])

  const handleTurnstileToken = React.useCallback((token: string) => {
    setTurnstileToken(token === '' ? null : token)
    if (token !== '') {
      setTurnstileError(null)
    }
  }, [])

  const handleTurnstileExpire = React.useCallback(() => {
    setTurnstileToken(null)
  }, [])

  const handleSubmit = React.useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      setStatusMessage(null)
      setErrorMessage(null)

      if (!termsAccepted) {
        setTermsError('Debes aceptar los Términos de Servicio para crear tu cuenta.')
        return
      }
      setTermsError(null)

      if (turnstileSiteKey !== '' && !turnstileToken) {
        setTurnstileError('Completa la verificación de seguridad para crear tu cuenta.')
        return
      }
      setTurnstileError(null)

      const validation = registerSchema.safeParse(values)
      if (!validation.success) {
        const zodErrors = validation.error.flatten().fieldErrors
        const nextErrors: RegisterFieldErrors = {}
        const keys = Object.keys(zodErrors) as Array<keyof RegisterSchema>
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
          await registerUser({
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            email: formData.email,
            password: formData.password,
            aceptoTerminos: termsAccepted,
            ...(turnstileToken ? { turnstileToken } : {}),
          })
          setStatusMessage('Registro completado. Redirigiendo al inicio de sesión...')
          setValues({ ...initialValues })
          
          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'No se pudo completar el registro.'
          setErrorMessage(message)
        }
      })
    },
    [values, router, termsAccepted, turnstileSiteKey, turnstileToken],
  )

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="mt-8 px-4">
        <h2 className="text-[#111418] text-lg font-bold leading-normal mb-4">Datos Personales</h2>

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
          <label htmlFor="nombre" className="flex flex-col min-w-40 flex-1">
            <span className="text-sm font-medium text-[#111418] mb-2">Nombre</span>
            <input
              id="nombre"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal"
              placeholder="Juan"
              value={values.nombre}
              onChange={handleChange}
              name="nombre"
              type="text"
              autoComplete="given-name"
              aria-invalid={fieldErrors.nombre ? 'true' : 'false'}
              aria-describedby={fieldErrors.nombre ? 'nombre-error' : undefined}
            />
          </label>
        </div>
        {fieldErrors.nombre ? (
          <p id="nombre-error" role="alert" className="text-sm text-red-600 px-4">
            {fieldErrors.nombre}
          </p>
        ) : null}

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
          <label htmlFor="apellidos" className="flex flex-col min-w-40 flex-1">
            <span className="text-sm font-medium text-[#111418] mb-2">Apellidos</span>
            <input
              id="apellidos"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal"
              placeholder="García López"
              value={values.apellidos}
              onChange={handleChange}
              name="apellidos"
              type="text"
              autoComplete="family-name"
              aria-invalid={fieldErrors.apellidos ? 'true' : 'false'}
              aria-describedby={fieldErrors.apellidos ? 'apellidos-error' : undefined}
            />
          </label>
        </div>
        {fieldErrors.apellidos ? (
          <p id="apellidos-error" role="alert" className="text-sm text-red-600 px-4">
            {fieldErrors.apellidos}
          </p>
        ) : null}

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
          <label htmlFor="email" className="flex flex-col min-w-40 flex-1">
            <span className="text-sm font-medium text-[#111418] mb-2">Correo electrónico</span>
            <input
              id="email"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal"
              placeholder="usuario@ejemplo.com"
              value={values.email}
              onChange={handleChange}
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={fieldErrors.email ? 'true' : 'false'}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
          </label>
        </div>
        {fieldErrors.email ? (
          <p id="email-error" role="alert" className="text-sm text-red-600 px-4">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="mt-8 px-4">
        <h2 className="text-[#111418] text-lg font-bold leading-normal mb-4">Seguridad</h2>

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
          <label htmlFor="password" className="flex flex-col min-w-40 flex-1">
            <span className="text-sm font-medium text-[#111418] mb-2">Contraseña</span>
            <input
              id="password"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal"
              placeholder="Introduce tu contraseña"
              value={values.password}
              onChange={handleChange}
              name="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={fieldErrors.password ? 'true' : 'false'}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
          </label>
        </div>
        <p className="text-[#60708a] text-sm font-normal leading-normal pb-3 pt-1 px-4">
          La contraseña debe tener al menos 8 caracteres
        </p>
        {fieldErrors.password ? (
          <p id="password-error" role="alert" className="text-sm text-red-600 px-4">
            {fieldErrors.password}
          </p>
        ) : null}

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
          <label htmlFor="confirmPassword" className="flex flex-col min-w-40 flex-1">
            <span className="text-sm font-medium text-[#111418] mb-2">Confirmar contraseña</span>
            <input
              id="confirmPassword"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal"
              placeholder="Repite tu contraseña"
              value={values.confirmPassword}
              onChange={handleChange}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
              aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
          </label>
        </div>
        {fieldErrors.confirmPassword ? (
          <p id="confirmPassword-error" role="alert" className="text-sm text-red-600 px-4">
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>

      <div className="px-4 mt-6">
        <label htmlFor="termsAccepted" className="flex gap-x-3 py-3 flex-row">
          <input
            id="termsAccepted"
            type="checkbox"
            checked={termsAccepted}
            onChange={handleTermsChange}
            className="h-5 w-5 rounded border-[#dbdfe6] border-2 bg-transparent text-[#4387f4] checked:bg-[#4387f4] checked:border-[#4387f4] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dbdfe6] focus:outline-none"
          />
          <span className="text-[#111418] text-base font-normal leading-normal">
            Acepto los{' '}
            <Link
              href="/terminos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4387f4] underline"
              onClick={(event) => event.stopPropagation()}
            >
              Términos de Servicio
            </Link>
          </span>
        </label>
      </div>

      {termsError ? (
        <p id="terms-error" role="alert" className="text-sm text-red-600 px-4">
          {termsError}
        </p>
      ) : null}

      {turnstileSiteKey !== '' ? (
        <div className="px-4 mt-2">
          <TurnstileWidget
            siteKey={turnstileSiteKey}
            onToken={handleTurnstileToken}
            onExpire={handleTurnstileExpire}
          />
        </div>
      ) : null}

      {turnstileError ? (
        <p id="turnstile-error" role="alert" className="text-sm text-red-600 px-4">
          {turnstileError}
        </p>
      ) : null}

      {errorMessage ? (
        <p role="alert" className="text-sm text-red-600 px-4 py-2">
          {errorMessage}
        </p>
      ) : null}

      {statusMessage ? (
        <p role="status" className="text-sm text-emerald-600 px-4 py-2">
          {statusMessage}
        </p>
      ) : null}

      <div className="flex px-4 py-3 mt-6">
        <button
          type="submit"
          disabled={isPending || !termsAccepted || (turnstileSiteKey !== '' && !turnstileToken)}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#4387f4] text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 disabled:opacity-60"
        >
          {isPending && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span className="truncate">
            {isPending ? 'Creando cuenta…' : 'Crear Cuenta'}
          </span>
        </button>
      </div>

      <p className="text-[#60708a] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center w-full max-w-[480px]">
        <Link href="/login" className="underline">
          ¿Ya tienes cuenta? Inicia Sesión
        </Link>
      </p>
    </form>
  )
}
