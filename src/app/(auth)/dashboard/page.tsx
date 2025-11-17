'use client'

import Link from 'next/link'
import React from 'react'
import { useLists } from '@/features/lists/hooks/use-lists'
import styles from './dashboard.module.css'

export default function DashboardPage() {
  const { data, isLoading, isError } = useLists(undefined, 1, 20)
  const lists = data?.data?.items ?? []

  return (
    <div className={styles.container}>
      <div className={styles.contentHeader}>
        <h2 className={styles.contentTitle}>Mis Listas</h2>
        <Link href="/lists/create" className={styles.createButton}>
          Crear Nueva Lista
        </Link>
      </div>

      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando tus listas...</p>
        </div>
      )}

      {isError && (
        <div className={styles.errorContainer}>
          <p>Error al cargar las listas. Por favor, intenta nuevamente.</p>
        </div>
      )}

      {!isLoading && !isError && lists.length === 0 && (
        <div className={styles.emptyState}>
          <svg className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className={styles.emptyTitle}>No tienes listas aún</h3>
          <p className={styles.emptyDescription}>
            Crea tu primera lista de compras para comenzar
          </p>
          <Link href="/lists/create" className={styles.emptyButton}>
            Crear mi primera lista
          </Link>
        </div>
      )}

      {!isLoading && !isError && lists.length > 0 && (
        <div className={styles.listsGrid}>
          {lists.map((list) => (
            <Link key={list.id} href={`/lists/${list.id}`} className={styles.listCard}>
              <div 
                className={styles.listThumbnail} 
                style={{ 
                  backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC9ckMvvb93Gr-McL5UIXxE5ZFQ-8e2s76c7KPXvuhgkr41CyBfExF27fAXmtYTBzh8ETG6I5MGKEhBlegJaug7-AvF4gwrEyPTEVFwqtVGAkL1llH4m4RyKREeTv6eF50Wt1_0piFE9SC0TC_cbS5bzC4eh2O4fDKD1x30A0_FOU_SdMYhfnkf7M_5sf4P3M6bC5fyqr-lg-xuPSLnb92TT1M42oKZJRaqmysNHHHRUwQ_pOf-Ggc7kZ-5B6TXiK-A0CskSVsY8V79")' 
                }} 
              />
              <div className={styles.listInfo}>
                <h3 className={styles.listTitle}>{list.nombre}</h3>
                {list.descripcion && (
                  <p className={styles.listDescription}>{list.descripcion}</p>
                )}
                <p className={styles.listMeta}>
                  {new Date(list.fechaCreacion).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
