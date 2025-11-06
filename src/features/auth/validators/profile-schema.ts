import { z } from 'zod'

export const profileSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, 'El nombre solo puede contener letras'),
  email: z
    .string()
    .email('Debe ser un correo electrónico válido')
    .min(1, 'El correo electrónico es obligatorio'),
  bio: z
    .string()
    .max(500, 'La biografía no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
