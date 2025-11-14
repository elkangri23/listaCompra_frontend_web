'use client'

import type { Metadata } from 'next'
import { useRouter } from 'next/navigation'
import { CreateListFormClient } from '@/features/lists/components/create-list-form-client'
import styles from './create.module.css'

// Note: metadata export removed because this is now a client component

export default function CreateListPage() {
  const router = useRouter()

  const handleSuccess = (listId: string) => {
    // Redirect to the newly created list
    router.push(`/lists/${listId}`)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Crear Nueva Lista</h1>
          <p className={styles.subtitle}>
            Crea una lista de la compra personalizada. Puedes agregar una tienda específica y productos después.
          </p>
        </div>

        <div className={styles.formCard}>
          <CreateListFormClient 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  )
}