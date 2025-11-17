'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InviteUserForm, InviteUserFormValues } from './invite-user-form';
import { ShareLinkSection } from './share-link-section';
import { useInviteUser } from '../hooks/use-invitations';
import { toast } from 'sonner';
import { Mail, Link2 } from 'lucide-react';

interface ShareListDialogProps {
  listId: string;
  listName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareListDialog({
  listId,
  listName,
  open,
  onOpenChange,
}: ShareListDialogProps) {
  const [activeTab, setActiveTab] = useState('email');
  const inviteUserMutation = useInviteUser(listId);

  const handleInviteByEmail = async (data: InviteUserFormValues) => {
    try {
      await inviteUserMutation.mutateAsync(data.email);
      toast.success(`Invitación enviada a ${data.email}`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        'Error al enviar la invitación';
      toast.error(errorMessage);
      console.error('Error inviting user:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-white"
      >
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Compartir lista
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            {listName
              ? `Comparte "${listName}" con otras personas`
              : 'Comparte esta lista con otras personas'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="email" 
                className="flex items-center justify-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Mail className="h-4 w-4" />
                <span className="font-medium">Por Email</span>
              </TabsTrigger>
              <TabsTrigger 
                value="link" 
                className="flex items-center justify-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Link2 className="h-4 w-4" />
                <span className="font-medium">Enlace Público</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 mt-0 pt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  💌 Envía una invitación por correo electrónico a un usuario registrado
                </p>
              </div>
              <InviteUserForm onSubmit={handleInviteByEmail} />
            </TabsContent>

            <TabsContent value="link" className="space-y-4 mt-0 pt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-900">
                  🔗 Genera un enlace que cualquier persona puede usar para acceder a la lista
                </p>
              </div>
              <ShareLinkSection listId={listId} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
