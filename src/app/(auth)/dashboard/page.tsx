'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { PartyPopper } from 'lucide-react'
import { useLists, useDeleteList } from '@/features/lists/hooks/use-lists'
import { useProducts } from '@/features/products/hooks/use-products'
import { OccasionListDialog } from '@/features/ai/components/occasion-list-dialog'
import { Button } from '@/components/ui/button'
import styles from './dashboard.module.css'

// Componente para mostrar el resumen de una lista individual
function ListCardWithSummary({ list, onDelete }: { list: any; onDelete: (id: string, nombre: string) => void }) {
  const { data: productsData, isError } = useProducts(list.id, { page: 1, limit: 200 })
  const products = (productsData as any)?.data?.items ?? productsData?.items ?? []
  
  // Si hay error (lista eliminada), no mostrar productos
  const totalProductos = isError ? 0 : products.length
  const productosComprados = isError ? 0 : products.filter((p: any) => p.comprado).length

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(list.id, list.nombre)
  }

  return (
    <div className={styles.listCardWrapper}>
      <Link href={`/lists/${list.id}`} className={styles.listCard}>
        <div 
          className={styles.listThumbnail} 
          style={{ 
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC9ckMvvb93Gr-McL5UIXxE5ZFQ-8e2s76c7KPXvuhgkr41CyBfExF27fAXmtYTBzh8ETG6I5MGKEhBlegJaug7-AvF4gwrEyPTEVFwqtVGAkL1llH4m4RyKREeTv6eF50Wt1_0piFE9SC0TC_cbS5bzC4eh2O4fDKD1x30A0_FOU_SdMYhfnkf7M_5sf4P3M6bC5fyqr-lg-xuPSLnb92TT1M42oKZJRaqmysNHHHRUwQ_pOf-Ggc7kZ-5B6TXiK-A0CskSVsY8V79")' 
          }} 
        />
        <div className={styles.listInfo}>
          <h3 className={styles.listTitle}>{list.nombre}</h3>
          
          {totalProductos > 0 && (
            <div className={styles.listProgress}>
              <span className={styles.progressText}>
                {productosComprados}/{totalProductos} productos
              </span>
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBar} 
                  style={{ 
                    width: `${Math.round((productosComprados / totalProductos) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
          
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
      <button 
        className={styles.deleteCardButton}
        onClick={handleDelete}
        title="Eliminar lista"
        aria-label="Eliminar lista"
      >
        <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
          <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
        </svg>
      </button>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useLists(undefined, 1, 20)
  const allLists = data?.data?.items ?? []
  // Filtrar solo listas activas
  const lists = allLists.filter((list: any) => list.activa !== false)
  const deleteListMutation = useDeleteList()
  const [occasionDialogOpen, setOccasionDialogOpen] = useState(false)

  const handleDeleteList = (listId: string, listName: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la lista "${listName}"?\n\n` +
      `Esta acción eliminará la lista y todos sus productos.\n\n` +
      `Esta acción NO se puede deshacer.`
    )

    if (confirmDelete) {
      deleteListMutation.mutate(listId, {
        onSuccess: () => {
          console.log('Lista eliminada correctamente')
        },
        onError: (error) => {
          console.error('Error al eliminar la lista:', error)
          alert('Error al eliminar la lista. Por favor, intenta de nuevo.')
        }
      })
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentHeader}>
        <h2 className={styles.contentTitle}>Mis Listas</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            onClick={() => setOccasionDialogOpen(true)}
            title="Generar lista por ocasión con IA"
          >
            <PartyPopper className="h-4 w-4 mr-2" />
            Generar por Ocasión
          </Button>
          <Link href="/lists/create" className={styles.createButton}>
            Crear Nueva Lista
          </Link>
        </div>
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
            <ListCardWithSummary key={list.id} list={list} onDelete={handleDeleteList} />
          ))}
        </div>
      )}
      
      <OccasionListDialog
        open={occasionDialogOpen}
        onOpenChange={setOccasionDialogOpen}
      />
    </div>
  )
}
