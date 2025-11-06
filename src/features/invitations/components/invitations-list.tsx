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
import { InvitationDto } from '@/types/dtos/invitations/InvitationDto';
import { useAcceptInvitation, useDeclineInvitation } from '../hooks/use-invitations';

interface InvitationsListProps {
  invitations: InvitationDto[];
}

export function InvitationsList({ invitations }: InvitationsListProps) {
  const acceptInvitationMutation = useAcceptInvitation();
  const declineInvitationMutation = useDeclineInvitation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Lista</TableHead>
          <TableHead>De</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => (
          <TableRow key={invitation.id}>
            <TableCell>{invitation.listName}</TableCell>
            <TableCell>{invitation.from}</TableCell>
            <TableCell>{new Date(invitation.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => acceptInvitationMutation.mutate(invitation.id)}
              >
                Aceptar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => declineInvitationMutation.mutate(invitation.id)}
              >
                Rechazar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
