'use client'

import Link from 'next/link'
import * as React from 'react'

import { Button, Input, Label, Text } from '@/components/ui'
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
    <form noValidate className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name" isRequired>
          Nombre completo
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Ana Pérez"
          value={values.name}
          onChange={handleChange}
          aria-invalid={fieldErrors.name ? 'true' : 'false'}
          aria-describedby={fieldErrors.name ? 'name-error' : undefined}
        />
        {fieldErrors.name ? (
          <Text id="name-error" role="alert" className="text-sm text-destructive">
            {fieldErrors.name}
          </Text>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" isRequired>
          Correo electrónico
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ana@ejemplo.com"
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
          autoComplete="new-password"
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" isRequired>
          Confirmar contraseña
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange}
          aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
          aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
        />
        {fieldErrors.confirmPassword ? (
          <Text id="confirmPassword-error" role="alert" className="text-sm text-destructive">
            {fieldErrors.confirmPassword}
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
        {isPending ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>

      <Text className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/login">
          Inicia sesión
        </Link>
      </Text>
    </form>
  )
}
