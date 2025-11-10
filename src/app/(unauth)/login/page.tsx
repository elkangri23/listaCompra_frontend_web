import type { Metadata } from 'next'
import { Suspense } from 'react'

import { LoginForm } from '@/features/auth/components/login-form'
import styles from './login.module.css'

export const metadata: Metadata = {
  title: 'Iniciar sesión | ListaCompra',
  description:
    'Accede a tus listas colaborativas con autenticación segura y protección contra accesos no autorizados.',
}

export default function LoginPage() {
  const heroUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUKmKFcOwLBHtR9WmpIiNK5cYkxO8QGTPTIkMiTSGi8WuRnTpC2zBCIyIMbMZWZB2a3EoIu_Na-NtFW8T5rWYULfqT2RZv1oQUj9JSqWy8SbpwQ4AfVc6D94PFud8aTy3sdff8dJ64e520BSaPTFxlD-NSvt5wIY-UuMmEv4tXL_G2MLV2QnCqBPNDqE5tjzv3JJ4V81ulnxujzGg8YzPcxZQrKGBvpMkz7cO_XnvONAGnstnT-ikQDNOIJExzWvT9OeTrUyKsW1a0'

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.heroWrapper}>
            <div className={styles.hero} style={{ backgroundImage: `url(${heroUrl})` }} />
          </div>

          <div className={styles.formWrapper}>
            <Suspense fallback={<div className={styles.fallback}>Cargando...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
