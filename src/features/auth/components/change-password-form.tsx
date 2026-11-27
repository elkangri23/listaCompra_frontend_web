'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
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
      form.reset()
    } catch (error) {
      const message =
        error instanceof AuthApiError
          ? error.message
          : 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.'

      toast.error('Error al cambiar la contraseña', {
        description: message,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }: any) => (
              <FormItem className="flex flex-col min-w-40 flex-1">
                <FormLabel className="text-[#111418] text-base font-medium leading-normal pb-2">
                  Contraseña actual
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Tu contraseña actual"
                    {...field}
                    disabled={changePasswordMutation.isPending}
                    autoComplete="current-password"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 border border-[#dbdfe6] bg-white focus:border-[#dbdfe6] h-14 placeholder:text-[#5b6b82] p-[15px] text-base font-normal leading-normal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }: any) => (
              <FormItem className="flex flex-col min-w-40 flex-1">
                <FormLabel className="text-[#111418] text-base font-medium leading-normal pb-2">
                  Contraseña nueva
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Mínimo 8 caracteres, con mayúscula, minúscula y número"
                    {...field}
                    disabled={changePasswordMutation.isPending}
                    autoComplete="new-password"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 border border-[#dbdfe6] bg-white focus:border-[#dbdfe6] h-14 placeholder:text-[#5b6b82] p-[15px] text-base font-normal leading-normal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }: any) => (
              <FormItem className="flex flex-col min-w-40 flex-1">
                <FormLabel className="text-[#111418] text-base font-medium leading-normal pb-2">
                  Confirmar contraseña nueva
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Repite la contraseña nueva"
                    {...field}
                    disabled={changePasswordMutation.isPending}
                    autoComplete="new-password"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 border border-[#dbdfe6] bg-white focus:border-[#dbdfe6] h-14 placeholder:text-[#5b6b82] p-[15px] text-base font-normal leading-normal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 px-4 py-3">
          <Button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="min-w-[84px] h-10 px-4 rounded-lg bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
          >
            {changePasswordMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Cambiar contraseña
          </Button>
        </div>
      </form>
    </Form>
  )
}
