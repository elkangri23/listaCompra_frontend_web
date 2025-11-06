'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProductForm, ProductFormProps, ProductFormValues } from './product-form';
import { Pencil } from 'lucide-react';

interface EditProductDialogProps {
  categories: ProductFormProps['categories'];
  defaultValues: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function EditProductDialog({
  categories,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: EditProductDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (values: ProductFormValues) => {
    await onSubmit(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Editar producto">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
        </DialogHeader>
        <ProductForm
          categories={categories}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Guardar cambios"
        />
      </DialogContent>
    </Dialog>
  );
}
