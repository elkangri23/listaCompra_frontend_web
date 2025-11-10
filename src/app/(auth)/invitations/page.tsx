'use client';

import { usePendingInvitations } from '@/features/invitations/hooks/use-invitations';
import { InvitationsList } from '@/features/invitations/components/invitations-list';

export default function InvitationsPage() {
  const { data: invitations, isLoading, isError } = usePendingInvitations();

  return (
    <section>
      <header>
        <h1>Invitaciones Pendientes</h1>
      </header>
      {isLoading && <p>Cargando...</p>}
      {isError && <p>Error al cargar las invitaciones.</p>}
      {invitations && <InvitationsList invitations={invitations} />}
    </section>
  );
}
