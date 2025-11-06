'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreateListForm } from './create-list-form';
import { CreateListDto } from '@/types/dtos/lists';

interface CreateListDialogProps {
  onSubmit: (data: CreateListDto) => void;
}

export function CreateListDialog({ onSubmit }: CreateListDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Crear Lista</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear una nueva lista</DialogTitle>
        </DialogHeader>
        <CreateListForm onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
