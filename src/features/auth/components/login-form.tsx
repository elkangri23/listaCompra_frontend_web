'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import Link from 'next/link'

import { loginSchema, type LoginSchema } from '@/features/auth/validators/schemas'

type LoginFieldErrors = Partial<Record<keyof LoginSchema, string>>

type FormEvent = React.FormEvent<HTMLFormElement>

type ChangeEvent = React.ChangeEvent<HTMLInputElement>

export function LoginForm() {
  const [values, setValues] = React.useState<LoginSchema>({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = React.useState<LoginFieldErrors>({})
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()

  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallbackUrl = searchParams.get('callbackUrl')
  const callbackUrl = React.useMemo(() => {
    if (!rawCallbackUrl) {
      return '/dashboard'
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://localhost'
      const parsed = new URL(rawCallbackUrl, origin)
      if (typeof window !== 'undefined' && parsed.origin !== window.location.origin) {
        return '/dashboard'
      }

      return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/dashboard'
    } catch {
      return '/dashboard'
    }
  }, [rawCallbackUrl])

  const handleChange = React.useCallback((event: ChangeEvent) => {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value } as LoginSchema))

    setFieldErrors((previous) => {
      if (!previous[name as keyof LoginSchema]) {
        return previous
      }
      return { ...previous, [name]: undefined }
    })
  }, [])

  const handleSubmit = React.useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      setErrorMessage(null)

      const validation = loginSchema.safeParse(values)
      if (!validation.success) {
        const zodErrors = validation.error.flatten().fieldErrors
        const nextErrors: LoginFieldErrors = {}
        const keys = Object.keys(zodErrors) as Array<keyof LoginSchema>
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
          const result = await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            redirect: false,
            callbackUrl,
          })

          if (!result || result.error) {
            const normalizedError =
              !result || result.error === 'CredentialsSignin'
                ? 'Correo electrónico o contraseña incorrectos.'
                : result.error || 'Error desconocido.'
            setErrorMessage(normalizedError)
            return
          }

          router.push(result.url ?? callbackUrl)
          router.refresh()
        } catch (error) {
          const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión. Inténtalo nuevamente.'
          setErrorMessage(message)
        }
      })
    },
    [callbackUrl, router, values],
  )

  return (
    <form noValidate onSubmit={handleSubmit}>
        <div className="flex w-full max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
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
        <div className="flex w-full max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label htmlFor="password" className="flex flex-col min-w-40 flex-1" aria-label="Contraseña">
            <input
              id="password"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60708a] p-4 text-base font-normal leading-normal"
              placeholder="Contraseña"
              value={values.password}
              onChange={handleChange}
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={fieldErrors.password ? 'true' : 'false'}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
          </label>
        </div>
        {fieldErrors.password ? (
          <p id="password-error" role="alert" className="text-sm text-red-600 px-4">
            {fieldErrors.password}
          </p>
        ) : null}
        {errorMessage ? (
          <p role="alert" className="text-sm text-red-600 px-4 py-2">
            {errorMessage}
          </p>
        ) : null}
        <div className="flex w-full max-w-[480px] px-4 py-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#4387f4] text-white text-sm font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">{isPending ? 'Iniciando sesión…' : 'Iniciar Sesión'}</span>
          </button>
        </div>
        <p className="text-[#60708a] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center w-full max-w-[480px]">
          <Link href="/register" className="underline">
            ¿No tienes cuenta? Regístrate
          </Link>
        </p>
    </form>
  )
}
