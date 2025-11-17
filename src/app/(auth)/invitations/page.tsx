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
      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}>
          <svg className="animate-spin h-6 w-6 text-[#4387f4]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Cargando invitaciones...</span>
        </div>
      )}
      {isError && (
        <div role="alert" style={{ padding: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '8px', margin: '1rem 0' }}>
          Error al cargar las invitaciones. Por favor, intenta nuevamente.
        </div>
      )}
      {invitations && <InvitationsList invitations={invitations} />}
    </div>
  );
}
