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
import { InviteUserForm } from './invite-user-form';
import { UserPlus } from 'lucide-react';

interface InviteUserDialogProps {
  onSubmit: (data: { email: string }) => void;
}

export function InviteUserDialog({ onSubmit }: InviteUserDialogProps) {
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubmit({ email: email.trim() });
      setEmail('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form onSubmit={handleSubmit}>
          <InviteUserForm email={email} setEmail={setEmail} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
