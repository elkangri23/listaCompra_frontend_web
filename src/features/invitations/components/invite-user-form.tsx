'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface InviteUserFormProps {
  email: string;
  setEmail: (email: string) => void;
}

export function InviteUserForm({ email, setEmail }: InviteUserFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email-invite" className="text-base font-semibold text-gray-900">
          Correo electrónico del usuario
        </label>
        <Input 
          type="email"
          id="email-invite"
          placeholder="ejemplo@dominio.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 text-base"
          autoComplete="email"
          tabIndex={0}
        />
        <p className="text-sm text-gray-600 mt-2">
          📧 El usuario recibirá un correo con la invitación para acceder a la lista
        </p>
      </div>
    </div>
  );
}
