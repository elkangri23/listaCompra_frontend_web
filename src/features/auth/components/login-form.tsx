'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'

import { Button, Input, Label, Text } from '@/components/ui'
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
    <form noValidate className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email" isRequired>
          Correo electrónico
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          value={values.email}
          onChange={handleChange}
          aria-invalid={fieldErrors.email ? 'true' : 'false'}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
        />
        {fieldErrors.email ? (
          <Text id="email-error" role="alert" className="text-sm text-destructive">
            {fieldErrors.email}
          </Text>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" isRequired>
          Contraseña
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          aria-invalid={fieldErrors.password ? 'true' : 'false'}
          aria-describedby={fieldErrors.password ? 'password-error' : undefined}
        />
        {fieldErrors.password ? (
          <Text id="password-error" role="alert" className="text-sm text-destructive">
            {fieldErrors.password}
          </Text>
        ) : null}
      </div>

      {errorMessage ? (
        <Text role="alert" className="text-sm text-destructive">
          {errorMessage}
        </Text>
      ) : null}

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </Button>
    </form>
  )
}
