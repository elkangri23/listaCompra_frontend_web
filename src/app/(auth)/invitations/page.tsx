'use client';

import { usePendingInvitations } from '@/features/invitations/hooks/use-invitations';
import { InvitationsList } from '@/features/invitations/components/invitations-list';
import styles from './invitations.module.css';
import { SkeletonRow } from '@/components/ui/skeleton'

export default function InvitationsPage() {
  const { data: invitations, isLoading, isError } = usePendingInvitations();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Invitaciones Pendientes</h1>
      </header>
      {isLoading && (
        <div role="status" aria-label="Cargando invitaciones…" style={{ padding: '0 1rem' }}>
          <span className="sr-only">Cargando invitaciones…</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}
      {isError && (
        <div role="alert" style={{ padding: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '8px', margin: '1rem 0' }}>
          No hemos podido cargar las invitaciones. Prueba de nuevo en un momento.
        </div>
      )}
      {invitations && <InvitationsList invitations={invitations} />}
    </div>
  );
}
