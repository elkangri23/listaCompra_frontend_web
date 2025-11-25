'use client';

import { useState } from 'react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InviteUserForm } from './invite-user-form';
import { ShareLinkSection } from './share-link-section';
import { useInviteUser } from '../hooks/use-invitations';
import { toast } from 'sonner';
import { Mail, Link2, Shield, Eye, Edit } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
});

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
  const [email, setEmail] = useState('');
  const [tipoPermiso, setTipoPermiso] = useState<'LECTURA' | 'ESCRITURA'>('LECTURA');
  const inviteUserMutation = useInviteUser(listId);

  const handleInviteByEmail = async (data: { email: string }) => {
    try {
      await inviteUserMutation.mutateAsync({ 
        email: data.email,
        tipoPermiso: tipoPermiso
      });
      toast.success(`Invitación enviada a ${data.email} con permisos de ${tipoPermiso.toLowerCase()}`);
      setEmail(''); // Reset email on success
      setTipoPermiso('LECTURA'); // Reset permissions to default
    } catch (error: any) {
      console.error('Error inviting user:', error);
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      const errorMessage = backendMessage || 'Error al enviar la invitación';
      toast.error(errorMessage);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = formSchema.safeParse({ email });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    handleInviteByEmail(result.data);
  }

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
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <InviteUserForm 
                  email={email}
                  setEmail={setEmail}
                />
                
                {/* Selector de permisos */}
                <div className="space-y-2">
                  <label htmlFor="permission-selector" className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-600" />
                    Nivel de acceso
                  </label>
                  <Select value={tipoPermiso} onValueChange={(value: 'LECTURA' | 'ESCRITURA') => setTipoPermiso(value)}>
                    <SelectTrigger id="permission-selector" className="w-full h-11">
                      <SelectValue placeholder="Selecciona el nivel de acceso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LECTURA" className="flex items-start gap-3 p-3">
                        <div className="flex items-center gap-2 w-full">
                          <Eye className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium">Solo lectura</div>
                            <div className="text-sm text-gray-600">Puede ver productos pero no modificarlos</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="ESCRITURA" className="flex items-start gap-3 p-3">
                        <div className="flex items-center gap-2 w-full">
                          <Edit className="h-4 w-4 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium">Lectura y escritura</div>
                            <div className="text-sm text-gray-600">Puede ver y modificar productos de la lista</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600">
                    {tipoPermiso === 'LECTURA' 
                      ? '👁️ El usuario podrá ver los productos pero no agregar, modificar o eliminar' 
                      : '✏️ El usuario podrá agregar, modificar y eliminar productos de la lista'
                    }
                  </p>
                </div>
                
                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={inviteUserMutation.isPending}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  {inviteUserMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Enviar Invitación
                    </>
                  )}
                </button>
              </form>
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
