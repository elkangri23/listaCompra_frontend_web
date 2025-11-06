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
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

const productFormSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio.' })
    .min(1, 'El nombre es obligatorio.')
    .max(200, 'Máximo 200 caracteres.'),
  descripcion: z
    .string()
    .max(1000, 'Máximo 1000 caracteres.')
    .optional(),
  cantidad: z
    .number({ invalid_type_error: 'La cantidad debe ser un número.' })
    .int('La cantidad debe ser un número entero.')
    .min(1, 'La cantidad mínima es 1.')
    .max(999_999, 'La cantidad máxima es 999999.'),
  unidad: z
    .string()
    .max(20, 'Máximo 20 caracteres.')
    .optional(),
  precio: z
    .number({ invalid_type_error: 'El precio debe ser un número.' })
    .min(0, 'El precio mínimo es 0.')
    .max(999_999.99, 'El precio máximo es 999999.99.')
    .optional(),
  urgente: z.boolean().default(false),
  categoriaId: z.string().optional(),
});

type ProductFormSchema = typeof productFormSchema;
type ProductFormInputValues = z.input<ProductFormSchema>;
export type ProductFormValues = z.output<ProductFormSchema>;

export interface ProductFormProps {
  defaultValues?: Partial<ProductFormInputValues>;
  categories: Array<{
    id: string;
    nombre: string;
  }>;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel?: string;
  onFieldChange?: (field: string, value: any) => void;
}

export function ProductForm({
  defaultValues,
  categories,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Guardar producto',
  onFieldChange,
}: ProductFormProps) {
  const form = useForm<ProductFormInputValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      cantidad: 1,
      unidad: '',
      precio: undefined,
      urgente: false,
      categoriaId: undefined,
      ...defaultValues,
    },
  });

  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      value: category.id,
      label: category.nombre,
    }));
  }, [categories]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const parsedValues = productFormSchema.parse(values);

    const sanitizedValues: ProductFormValues = {
      ...parsedValues,
      descripcion:
        parsedValues.descripcion && parsedValues.descripcion.trim().length > 0
          ? parsedValues.descripcion
          : undefined,
      unidad:
        parsedValues.unidad && parsedValues.unidad.trim().length > 0
          ? parsedValues.unidad
          : undefined,
      categoriaId:
        parsedValues.categoriaId && parsedValues.categoriaId.trim().length > 0
          ? parsedValues.categoriaId
          : undefined,
      precio:
        typeof parsedValues.precio === 'number' && !Number.isNaN(parsedValues.precio)
          ? parsedValues.precio
          : undefined,
    };

    await onSubmit(sanitizedValues);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Leche semidesnatada" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange?.('nombre', e.target.value);
                  }}
                />
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
                <Input 
                  placeholder="Opcional" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange?.('descripcion', e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="cantidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const rawValue = event.target.value;
                      field.onChange(
                        rawValue === '' ? undefined : Number(rawValue)
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad</FormLabel>
                <FormControl>
                  <Input placeholder="kg, l, pack..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="precio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    inputMode="decimal"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const rawValue = event.target.value;
                      field.onChange(
                        rawValue === '' ? undefined : Number(rawValue)
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoriaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className={cn(
                      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      'disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                  >
                    <option value="">Sin categoría</option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="urgente"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                Marcar como urgente
                {field.value && <Badge variant="secondary">Urgente</Badge>}
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
