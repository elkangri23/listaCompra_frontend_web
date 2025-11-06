'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lista } from '@/types/Lista.types';

const formSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
});

export type EditListFormValues = z.infer<typeof formSchema>;

interface EditListFormProps {
  list: Lista;
  onSubmit: (data: EditListFormValues) => void;
}

export function EditListForm({ list, onSubmit }: EditListFormProps) {
  const form = useForm<EditListFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: list.nombre,
      descripcion: list.descripcion ?? '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Mi nueva lista" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Una breve descripción" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Guardar</Button>
      </form>
    </Form>
  );
}
