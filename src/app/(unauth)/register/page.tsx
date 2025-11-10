import type { Metadata } from 'next'

import { RegisterForm } from '@/features/auth/components/register-form'
import styles from './register.module.css'

export const metadata: Metadata = {
  title: 'Crear cuenta | ListaCompra',
  description:
    'Regístrate en segundos para comenzar a crear y compartir listas colaborativas con tu equipo o familia.',
}

export default function RegisterPage() {
  const heroUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAySoRRfzpm-wiSAK0-SOxYXr_-XoDASqzG8kb2i9_MExsIL8HVmVRkS25CZKo0X0xvfripKv-My8PPf0rEmpYXuUNVtG-Z_mr0h1lVSqOE8287OV6crIrRRVKpe3e8UeW57-I661S8saVF9DvnkGY6Fz22ScdGXi9QOGFCkW724ZNI4bOv_bg2FqLngU6s6_4pTpmaiA6YuDh-wBsvCyEns8MnCW4SIIr_UAwVrb_pE2ObN8jO0lm9wdQ6KdLU31tZ2atCuKzsw5Wq'

  return (
    <div className={styles.root}>
      <div className={styles.center}>
        <div className={styles.card}>
          <div className={styles.hero} style={{ backgroundImage: `url(${heroUrl})` }} />
          <div className={styles.form}>
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}
