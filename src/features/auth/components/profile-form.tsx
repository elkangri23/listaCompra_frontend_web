'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useProfile, useUpdateProfile } from '@/features/auth/hooks/use-profile'
import { profileSchema, type ProfileFormValues } from '@/features/auth/validators/profile-schema'
import { AuthApiError } from '@/features/auth/services/auth-service'

export function ProfileForm() {
  const { data: user, isLoading: isLoadingProfile } = useProfile()
  const updateProfileMutation = useUpdateProfile()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombre: '',
      email: '',
      bio: '',
    },
  })

  // Cargar datos del usuario cuando estén disponibles
  useEffect(() => {
    if (user) {
      form.reset({
        nombre: user.name || '',
        email: user.email || '',
        bio: '', // El backend no devuelve bio actualmente
      })
    }
  }, [user, form])

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfileMutation.mutateAsync(values)

      toast.success('Perfil actualizado', {
        description: 'Tus datos se han guardado correctamente.',
      })
    } catch (error) {
      const message =
        error instanceof AuthApiError
          ? error.message
          : 'No se pudo actualizar el perfil. Inténtalo nuevamente.'

      toast.error('Error al actualizar perfil', {
        description: message,
      })
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {/* Nombre Completo */}
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem className="flex flex-col min-w-40 flex-1">
                <FormLabel className="text-[#111418] text-base font-medium leading-normal pb-2">
                  Nombre Completo
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tu nombre completo"
                    {...field}
                    disabled={updateProfileMutation.isPending}
                    autoComplete="name"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border border-[#dbdfe6] bg-white focus:border-[#dbdfe6] h-14 placeholder:text-[#60708a] p-[15px] text-base font-normal leading-normal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email */}
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col min-w-40 flex-1">
                <FormLabel className="text-[#111418] text-base font-medium leading-normal pb-2">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    {...field}
                    disabled={updateProfileMutation.isPending}
                    autoComplete="email"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border border-[#dbdfe6] bg-white focus:border-[#dbdfe6] h-14 placeholder:text-[#60708a] p-[15px] text-base font-normal leading-normal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Bio (opcional) */}
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="flex flex-col min-w-40 flex-1">
                <FormLabel className="text-[#111418] text-base font-medium leading-normal pb-2">
                  Biografía (opcional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Cuéntanos algo sobre ti"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border border-[#dbdfe6] bg-white focus:border-[#dbdfe6] placeholder:text-[#60708a] p-[15px] text-base font-normal leading-normal"
                    rows={4}
                    {...field}
                    disabled={updateProfileMutation.isPending}
                  />
                </FormControl>
                <FormDescription className="text-[#60708a] text-sm">
                  Máximo 500 caracteres
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={updateProfileMutation.isPending || !form.formState.isDirty}
            className="min-w-[84px] h-10 px-4 rounded-lg border border-[#dbdfe6] text-[#111418] hover:bg-[#f0f2f5]"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending || !form.formState.isDirty}
            className="min-w-[84px] h-10 px-4 rounded-lg bg-[#4387f4] text-white hover:bg-[#3275e3]"
          >
            {updateProfileMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Guardar cambios
          </Button>
        </div>
      </form>
    </Form>
  )
}
