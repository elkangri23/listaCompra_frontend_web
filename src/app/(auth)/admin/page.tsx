'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './admin.module.css'
import { SkeletonCard } from '@/components/ui/skeleton'

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

/**
 * Estado vacío honesto de las secciones que aún no existen.
 * El esqueleto es una vista previa decorativa de cómo se verá el contenido.
 */
function ComingSoon({ section }: { section: string }) {
  return (
    <div className={styles.comingSoon}>
      <h2 className={styles.sectionTitle}>{section}</h2>
      <p>Próximamente: esta sección llega en la siguiente fase.</p>
      <div className={styles.skeletonGrid} aria-hidden="true">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

/**
 * La gestión de usuarios ya existe en su propia pantalla (/admin/users).
 * En esta fase el shell solo la enlaza; la integración completa en la
 * pestaña llega en la fase 2.
 */
function UsersTabContent() {
  return (
    <div className={styles.comingSoon}>
      <h2 className={styles.sectionTitle}>Usuarios</h2>
      <p>
        La gestión de usuarios ya existe en su propia pantalla. La integración
        completa dentro de esta pestaña llega en la fase 2.
      </p>
      <Link href="/admin/users" className={styles.linkButton}>
        Abrir la gestión de usuarios
      </Link>
    </div>
  )
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('estado')
  const activeLabel =
    TABS.find((tab) => tab.id === activeTab)?.label ?? 'Estado'

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

      {activeTab === 'usuarios' ? (
        <UsersTabContent />
      ) : (
        <ComingSoon section={activeLabel} />
      )}
    </div>
  )
}
