import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'
import styles from './forgot-password.module.css'

export const metadata: Metadata = {
  title: 'Recuperar contraseña | ListaCompra',
  description: 'Solicita recuperación de contraseña por email.',
}

export default function ForgotPasswordPage() {

  return (
    <div className={styles.root}>
      <div className={styles.card} style={{ maxWidth: 520 }}>
        <div className={styles.hero}>
          <span aria-hidden="true">🛒</span>{' '}
          <span>ListaCompra</span>
        </div>
        <div className={styles.form}>
          <Suspense fallback={<div className={styles.fallback}>Cargando...</div>}>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}