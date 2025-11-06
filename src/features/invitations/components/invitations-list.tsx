'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InvitationDto } from '@/types/dtos/invitations/InvitationDto';
import { useAcceptInvitation, useDeclineInvitation } from '../hooks/use-invitations';
import { Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface InvitationsListProps {
  invitations: InvitationDto[];
}

export function InvitationsList({ invitations }: InvitationsListProps) {
  const acceptInvitationMutation = useAcceptInvitation();
  const declineInvitationMutation = useDeclineInvitation();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (invitationId: string, listName: string) => {
    setProcessingId(invitationId);
    try {
      await acceptInvitationMutation.mutateAsync(invitationId);
      toast.success(`Te has unido a "${listName}" exitosamente`);
    } catch (error) {
      toast.error('Error al aceptar la invitación');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitationId: string, listName: string) => {
    setProcessingId(invitationId);
    try {
      await declineInvitationMutation.mutateAsync(invitationId);
      toast.success(`Has rechazado la invitación a "${listName}"`);
    } catch (error) {
      toast.error('Error al rechazar la invitación');
    } finally {
      setProcessingId(null);
    }
  };

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Check className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No tienes invitaciones pendientes</h3>
        <p className="text-sm text-muted-foreground">
          Cuando alguien te invite a una lista, aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lista</TableHead>
            <TableHead>Invitado por</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell className="font-medium">{invitation.listName}</TableCell>
              <TableCell>{invitation.from}</TableCell>
              <TableCell>
                {new Date(invitation.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Pendiente
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAccept(invitation.id, invitation.listName)}
                    disabled={processingId === invitation.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {processingId === invitation.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Aceptar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDecline(invitation.id, invitation.listName)}
                    disabled={processingId === invitation.id}
                    className="hover:bg-red-50 hover:text-red-700"
                  >
                    {processingId === invitation.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Rechazar
                      </>
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
