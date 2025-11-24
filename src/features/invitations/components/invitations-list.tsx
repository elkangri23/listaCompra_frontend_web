'use client';

import { InvitationDto } from '@/types/dtos/invitations';
import { useDeclineInvitation } from '../hooks/use-invitations';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface InvitationsListProps {
  invitations: InvitationDto[];
}

export function InvitationsList({ invitations }: InvitationsListProps) {
  const declineInvitationMutation = useDeclineInvitation();
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (invitationId: string, listName: string, listId?: string) => {
    // NOTA: No existe endpoint /accept en el backend
    // Simplemente redirigir a la lista si tenemos el listId
    if (listId) {
      router.push(`/lists/${listId}`);
      alert(`Accediendo a "${listName}"`);
    } else {
      alert('No se puede acceder a la lista: ID no disponible');
    }
  };

  const handleDecline = async (invitationId: string, listName: string) => {
    setProcessingId(invitationId);
    try {
      await declineInvitationMutation.mutateAsync(invitationId);
      alert(`Has rechazado la invitación a "${listName}"`); // Reemplazado toast con alert
    } catch (error) {
      alert('Error al rechazar la invitación'); // Reemplazado toast con alert
    } finally {
      setProcessingId(null);
    }
  };

  if (invitations.length === 0) {
    return (
      <div>
        <h3>No tienes invitaciones pendientes</h3>
        <p>
          Cuando alguien te invite a una lista, aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Lista</th>
            <th>Invitado por</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((invitation) => (
            <tr key={invitation.id}>
              <td>{invitation.listName}</td>
              <td>{invitation.from}</td>
              <td>
                {new Date(invitation.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td>
                <span>
                  Pendiente
                </span>
              </td>
              <td>
                <div>
                  <button
                    onClick={() => handleAccept(invitation.id, invitation.listName)}
                    disabled={processingId === invitation.id}
                  >
                    {processingId === invitation.id ? (
                      'Agregando...'
                    ) : (
                      'Aceptar'
                    )}
                  </button>
                  <button
                    onClick={() => handleDecline(invitation.id, invitation.listName)}
                    disabled={processingId === invitation.id}
                  >
                    {processingId === invitation.id ? (
                      'Rechazando...'
                    ) : (
                      'Rechazar'
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}