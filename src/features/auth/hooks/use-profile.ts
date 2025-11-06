import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import {
  changePassword,
  getCurrentUser,
  updateProfile,
} from '@/features/auth/services/auth-service'
import type { ProfileFormValues } from '@/features/auth/validators/profile-schema'
import type { ChangePasswordFormValues } from '@/features/auth/validators/password-schema'

const PROFILE_QUERY_KEY = ['profile'] as const

/**
 * Hook para obtener los datos del perfil del usuario actual
 */
export function useProfile() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getCurrentUser,
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  })
}

/**
 * Hook para actualizar el perfil del usuario
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { update } = useSession()

  return useMutation({
    mutationFn: (values: ProfileFormValues) => updateProfile(values),
    onSuccess: async (updatedUser) => {
      // Invalidar cache del perfil
      await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })

      // Actualizar sesión de NextAuth con los nuevos datos
      await update({
        user: {
          name: updatedUser.name,
          email: updatedUser.email,
          image: updatedUser.image,
        },
      })
    },
  })
}

/**
 * Hook para cambiar la contraseña del usuario
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (values: ChangePasswordFormValues) => changePassword(values),
  })
}
