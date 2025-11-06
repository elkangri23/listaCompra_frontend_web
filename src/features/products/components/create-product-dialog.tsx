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

interface CreateProductDialogProps {
  categories: ProductFormProps['categories'];
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function CreateProductDialog({
  categories,
  onSubmit,
  isSubmitting = false,
}: CreateProductDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (values: ProductFormValues) => {
    await onSubmit(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Agregar producto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar nuevo producto</DialogTitle>
        </DialogHeader>
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Agregar"
        />
      </DialogContent>
    </Dialog>
  );
}
