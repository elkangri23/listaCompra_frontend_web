import { z } from 'zod'

const emailSchema = z
  .string({ required_error: 'El correo electrónico es obligatorio.' })
  .trim()
  .min(1, 'El correo electrónico es obligatorio.')
  .email('Ingresa un correo electrónico válido.')

const passwordSchema = z
  .string({ required_error: 'La contraseña es obligatoria.' })
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(100, 'La contraseña no puede exceder 100 caracteres.')

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'El nombre es obligatorio.' })
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres.')
      .max(100, 'El nombre no puede exceder 100 caracteres.'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
