'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'

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
import { toast } from 'sonner'
import { useChangePassword } from '@/features/auth/hooks/use-profile'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/auth/validators/password-schema'
import { AuthApiError } from '@/features/auth/services/auth-service'

export function ChangePasswordForm() {
  const changePasswordMutation = useChangePassword()

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await changePasswordMutation.mutateAsync(values)

      toast.success('Contraseña actualizada', {
        description: 'Tu contraseña se ha cambiado correctamente.',
      })

      // Limpiar formulario tras éxito
      form.reset()
    } catch (error) {
      const message =
        error instanceof AuthApiError
          ? error.message
          : 'No se pudo cambiar la contraseña. Inténtalo nuevamente.'

      toast.error('Error al cambiar contraseña', {
        description: message,
      })
    }
  }

  return (
    <div className="p-4">
      <div className="flex flex-1 flex-col items-start justify-between gap-4 rounded-lg border border-[#dbdfe6] bg-white p-5">
        <div className="flex flex-col gap-1 w-full">
          <p className="text-[#111418] text-base font-bold leading-tight">Cambiar Contraseña</p>
          <p className="text-[#60708a] text-base font-normal leading-normal">
            Actualiza tu contraseña para mantener tu cuenta segura.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4 w-full max-w-[480px]">
              {/* Contraseña actual */}
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#111418] text-base font-medium leading-normal">
                      Contraseña actual
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Ingresa tu contraseña actual"
                          {...field}
                          disabled={changePasswordMutation.isPending}
                          autoComplete="current-password"
                          className="form-input w-full rounded-lg text-[#111418] border border-[#dbdfe6] bg-white h-12 placeholder:text-[#60708a] p-[15px] pr-12 text-base"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          disabled={changePasswordMutation.isPending}
                          aria-label={showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-[#60708a]" />
                          ) : (
                            <Eye className="h-4 w-4 text-[#60708a]" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nueva contraseña */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#111418] text-base font-medium leading-normal">
                      Nueva contraseña
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Ingresa tu nueva contraseña"
                          {...field}
                          disabled={changePasswordMutation.isPending}
                          autoComplete="new-password"
                          className="form-input w-full rounded-lg text-[#111418] border border-[#dbdfe6] bg-white h-12 placeholder:text-[#60708a] p-[15px] pr-12 text-base"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={changePasswordMutation.isPending}
                          aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-[#60708a]" />
                          ) : (
                            <Eye className="h-4 w-4 text-[#60708a]" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-[#60708a] text-sm">
                      Mínimo 8 caracteres, debe contener mayúscula, minúscula y número.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirmar contraseña */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#111418] text-base font-medium leading-normal">
                      Confirmar nueva contraseña
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirma tu nueva contraseña"
                          {...field}
                          disabled={changePasswordMutation.isPending}
                          autoComplete="new-password"
                          className="form-input w-full rounded-lg text-[#111418] border border-[#dbdfe6] bg-white h-12 placeholder:text-[#60708a] p-[15px] pr-12 text-base"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={changePasswordMutation.isPending}
                          aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-[#60708a]" />
                          ) : (
                            <Eye className="h-4 w-4 text-[#60708a]" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botones */}
              <div className="flex justify-end gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={changePasswordMutation.isPending || !form.formState.isDirty}
                  className="min-w-[84px] h-10 px-4 rounded-lg border border-[#dbdfe6] text-[#111418] hover:bg-[#f0f2f5]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending || !form.formState.isDirty}
                  className="min-w-[84px] h-10 px-4 rounded-lg bg-[#4387f4] text-white hover:bg-[#3275e3]"
                >
                  {changePasswordMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Cambiar Contraseña
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
