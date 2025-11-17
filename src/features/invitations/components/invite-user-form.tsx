'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
});

export type InviteUserFormValues = z.infer<typeof formSchema>;

interface InviteUserFormProps {
  onSubmit: (data: InviteUserFormValues) => void;
}

export function InviteUserForm({ onSubmit }: InviteUserFormProps) {
  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-gray-900">
                Correo electrónico del usuario
              </FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="ejemplo@dominio.com" 
                  id={field.name}
                  {...field}
                  className="w-full h-11 text-base"
                  autoComplete="email"
                  disabled={form.formState.isSubmitting}
                  tabIndex={0}
                />
              </FormControl>
              <FormMessage className="text-sm text-red-600 font-medium" />
              <p className="text-sm text-gray-600 mt-2">
                📧 El usuario recibirá un correo con la invitación para acceder a la lista
              </p>
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Invitación'}
        </Button>
      </form>
    </FormProvider>
  );
}
