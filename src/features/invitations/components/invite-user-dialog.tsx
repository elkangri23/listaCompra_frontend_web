'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InviteUserForm, InviteUserFormValues } from './invite-user-form';
import { UserPlus } from 'lucide-react';

interface InviteUserDialogProps {
  onSubmit: (data: InviteUserFormValues) => void;
}

export function InviteUserDialog({ onSubmit }: InviteUserDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <UserPlus className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Invitar Usuario
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar usuario a la lista</DialogTitle>
        </DialogHeader>
        <InviteUserForm onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
