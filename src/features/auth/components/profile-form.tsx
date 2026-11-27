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
import { SkeletonForm } from '@/components/ui/skeleton'

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
      <div role="status" aria-label="Cargando perfil…">
        <span className="sr-only">Cargando perfil…</span>
        <SkeletonForm />
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
            render={({ field }: any) => (
              <FormItem className="flex flex-col min-w-40 flex-1">
                <FormLabel className="text-[#111418] text-base font-medium leading-normal pb-2">
                  Nombre Completo
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Juan García López"
                    {...field}
                    disabled={updateProfileMutation.isPending}
                    autoComplete="name"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 border border-[#dbdfe6] bg-white focus:border-[#dbdfe6] h-14 placeholder:text-[#5b6b82] p-[15px] text-base font-normal leading-normal"
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
            render={({ field }: any) => (
              <FormItem className="flex flex-col min-w-40 flex-1">
                <FormLabel className="text-[#111418] text-base font-medium leading-normal pb-2">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    {...field}
                    readOnly
                    aria-readonly="true"
                    disabled={updateProfileMutation.isPending}
                    autoComplete="email"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 border border-[#dbdfe6] bg-[#f0f2f5] focus:border-[#dbdfe6] h-14 placeholder:text-[#5b6b82] p-[15px] text-base font-normal leading-normal"
                  />
                </FormControl>
                <FormDescription className="text-[#5b6b82] text-sm">
                  Este correo no se puede cambiar.
                </FormDescription>
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
            render={({ field }: any) => (
              <FormItem className="flex flex-col min-w-40 flex-1">
                <FormLabel className="text-[#111418] text-base font-medium leading-normal pb-2">
                  Biografía (opcional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Cuéntanos algo sobre ti"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 border border-[#dbdfe6] bg-white focus:border-[#dbdfe6] placeholder:text-[#5b6b82] p-[15px] text-base font-normal leading-normal"
                    rows={4}
                    {...field}
                    disabled={updateProfileMutation.isPending}
                  />
                </FormControl>
                <FormDescription className="text-[#5b6b82] text-sm">
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
            onClick={() =>
              form.reset({
                nombre: user?.name || '',
                email: user?.email || '',
                bio: '',
              })
            }
            disabled={updateProfileMutation.isPending || !form.formState.isDirty}
            className="min-w-[84px] h-10 px-4 rounded-lg border border-[#dbdfe6] text-[#111418] hover:bg-[#f0f2f5]"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending || !form.formState.isDirty}
            className="min-w-[84px] h-10 px-4 rounded-lg bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
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
