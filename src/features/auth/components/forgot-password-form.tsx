'use client'

import Link from 'next/link'
import * as React from 'react'

import { Button, Input, Label, Text } from '@/components/ui'
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

      {errorMessage ? (
        <Text role="alert" className="text-sm text-destructive">
          {errorMessage}
        </Text>
      ) : null}

      {statusMessage ? (
        <Text role="status" className="text-sm text-emerald-600">
          {statusMessage}
        </Text>
      ) : null}

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? 'Enviando enlace…' : 'Enviar instrucciones'}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          ¿Recordaste tu contraseña?{' '}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/login">
            Inicia sesión
          </Link>
        </p>
        <p>
          ¿No tienes cuenta?{' '}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/register">
            Regístrate
          </Link>
        </p>
      </div>
    </form>
  )
}
