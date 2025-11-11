'use client';

import { usePendingInvitations } from '@/features/invitations/hooks/use-invitations';
import { InvitationsList } from '@/features/invitations/components/invitations-list';
import styles from './invitations.module.css';

export default function InvitationsPage() {
  const { data: invitations, isLoading, isError } = usePendingInvitations();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Invitaciones Pendientes</h1>
      </header>
      {isLoading && <p className={styles.fallback}>Cargando...</p>}
      {isError && <p style={{ color: '#ef4444' }}>Error al cargar las invitaciones.</p>}
      {invitations && <InvitationsList invitations={invitations} />}
    </div>
  );
}
