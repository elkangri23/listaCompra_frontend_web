'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EditListForm, EditListFormValues } from './edit-list-form';
import { Lista } from '@/types/Lista.types';
import { Pencil } from 'lucide-react';

interface EditListDialogProps {
  list: Lista;
  onSubmit: (data: EditListFormValues) => void;
}

export function EditListDialog({ list, onSubmit }: EditListDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar lista</DialogTitle>
        </DialogHeader>
        <EditListForm list={list} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
