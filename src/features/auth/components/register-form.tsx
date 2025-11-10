'use client'

import Link from 'next/link'
import * as React from 'react'

import { registerUser } from '@/features/auth/services/auth-service'
import { registerSchema, type RegisterSchema } from '@/features/auth/validators/schemas'

type RegisterFieldErrors = Partial<Record<keyof RegisterSchema, string>>

type FormEvent = React.FormEvent<HTMLFormElement>

type ChangeEvent = React.ChangeEvent<HTMLInputElement>

const initialValues: RegisterSchema = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function RegisterForm() {
  const [values, setValues] = React.useState<RegisterSchema>(initialValues)
  const [fieldErrors, setFieldErrors] = React.useState<RegisterFieldErrors>({})
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()
  const [termsAccepted, setTermsAccepted] = React.useState(false)

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

  const handleSubmit = React.useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      setStatusMessage(null)
      setErrorMessage(null)

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
            name: formData.name,
            email: formData.email,
            password: formData.password,
          })
          setStatusMessage('Registro completado. Revisa tu correo para confirmar la cuenta o inicia sesión directamente.')
          setValues({ ...initialValues })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'No se pudo completar el registro.'
          setErrorMessage(message)
        }
      })
    },
    [values],
  )

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="mt-8 px-4">
        <h2 className="text-[#111418] text-lg font-bold leading-normal mb-4">Datos Personales</h2>

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
          <label htmlFor="name" className="flex flex-col min-w-40 flex-1" aria-label="Nombre completo">
            <input
              id="name"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal"
              placeholder="Nombre Completo"
              value={values.name}
              onChange={handleChange}
              name="name"
              type="text"
              autoComplete="name"
              aria-invalid={fieldErrors.name ? 'true' : 'false'}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            />
          </label>
        </div>
        {fieldErrors.name ? (
          <p id="name-error" role="alert" className="text-sm text-red-600 px-4">
            {fieldErrors.name}
          </p>
        ) : null}

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
          <label htmlFor="email" className="flex flex-col min-w-40 flex-1" aria-label="Correo electrónico">
            <input
              id="email"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal"
              placeholder="Email"
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
          <label htmlFor="password" className="flex flex-col min-w-40 flex-1" aria-label="Contraseña">
            <input
              id="password"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal"
              placeholder="Contraseña"
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
        <p className="text-[#60708a] text-sm font-normal leading-normal pb-3 pt-1">
          La contraseña debe tener al menos 8 caracteres
        </p>
        {fieldErrors.password ? (
          <p id="password-error" role="alert" className="text-sm text-red-600 px-4">
            {fieldErrors.password}
          </p>
        ) : null}

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
          <label htmlFor="confirmPassword" className="flex flex-col min-w-40 flex-1" aria-label="Confirmar contraseña">
            <input
              id="confirmPassword"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal"
              placeholder="Confirmar Contraseña"
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
            onChange={(e: any) => setTermsAccepted(e.target.checked)}
            className="h-5 w-5 rounded border-[#dbdfe6] border-2 bg-transparent text-[#4387f4] checked:bg-[#4387f4] checked:border-[#4387f4] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dbdfe6] focus:outline-none"
          />
          <p className="text-[#111418] text-base font-normal leading-normal">
            Acepto los Términos de Servicio
          </p>
        </label>
      </div>

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
          disabled={isPending || !termsAccepted}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#4387f4] text-white text-sm font-bold leading-normal tracking-[0.015em]"
        >
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
