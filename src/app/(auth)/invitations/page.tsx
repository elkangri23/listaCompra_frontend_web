'use client';

import { Heading } from '@/components/ui';
import { usePendingInvitations } from '@/features/invitations/hooks/use-invitations';
import { InvitationsList } from '@/features/invitations/components/invitations-list';

export default function InvitationsPage() {
  const { data: invitations, isLoading, isError } = usePendingInvitations();

  return (
    <section className="p-4 md:p-6">
      <header className="mb-6">
        <Heading level={1}>Invitaciones Pendientes</Heading>
      </header>
      {isLoading && <p>Cargando...</p>}
      {isError && <p>Error al cargar las invitaciones.</p>}
      {invitations && <InvitationsList invitations={invitations} />}
    </section>
  );
}
