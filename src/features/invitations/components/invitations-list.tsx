'use client';

import { InvitationDto } from '@/types/dtos/invitations/InvitationDto';
import { useAcceptInvitation, useDeclineInvitation } from '../hooks/use-invitations';
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
      alert(`Te has unido a "${listName}" exitosamente`); // Reemplazado toast con alert
    } catch (error) {
      alert('Error al aceptar la invitación'); // Reemplazado toast con alert
    } finally {
      setProcessingId(null);
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