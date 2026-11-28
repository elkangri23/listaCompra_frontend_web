'use client'

import { useState } from 'react'
import styles from './admin.module.css'
import { AdminStatusSection } from '@/features/admin/components/admin-status-section'
import { AdminUsersSection } from '@/features/admin/components/admin-users-section'
import { AdminAISection } from '@/features/admin/components/admin-ai-section'
import { AdminAuditSection } from '@/features/admin/components/admin-audit-section'
import { AdminSecuritySection } from '@/features/admin/components/admin-security-section'
import { AdminBackupsSection } from '@/features/admin/components/admin-backups-section'
import { AdminMetricsSection } from '@/features/admin/components/admin-metrics-section'

type AdminTab =
  | 'estado'
  | 'usuarios'
  | 'ia'
  | 'auditoria'
  | 'seguridad'
  | 'copias'
  | 'metricas'

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'estado', label: 'Estado' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'ia', label: 'IA' },
  { id: 'auditoria', label: 'Auditoría' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'copias', label: 'Copias' },
  { id: 'metricas', label: 'Métricas' },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('estado')

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Administración</h1>
      <p className={styles.subtitle}>
        Todo lo de la página como administrador, no como usuario.
      </p>

      <div className={styles.tabs}>
        <div
          className={styles.tabsContainer}
          role="tablist"
          aria-label="Secciones de administración"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : styles.tabInactive}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabText}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'estado' ? (
        <AdminStatusSection />
      ) : activeTab === 'usuarios' ? (
        <AdminUsersSection />
      ) : activeTab === 'ia' ? (
        <AdminAISection />
      ) : activeTab === 'auditoria' ? (
        <AdminAuditSection />
      ) : activeTab === 'seguridad' ? (
        <AdminSecuritySection />
      ) : activeTab === 'copias' ? (
        <AdminBackupsSection />
      ) : (
        <AdminMetricsSection />
      )}
    </div>
  )
}
