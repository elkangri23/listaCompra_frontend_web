'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from '@/app/homepage.module.css'

const STORAGE_KEY = 'listacompra-cookies-aceptadas'

/**
 * Banner de aviso de cookies (item 2).
 * Solo cookies necesarias (sesión); nada de rastreo ni publicidad.
 * El consentimiento se guarda en localStorage para no volver a mostrarlo.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== '1') {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) {
    return null
  }

  const aceptar = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Sin localStorage, el banner se oculta solo en esta visita
    }
    setVisible(false)
  }

  return (
    <div className={styles.cookieBanner} role="region" aria-label="Aviso de cookies">
      <p className={styles.cookieText}>
        Usamos solo las cookies necesarias para que puedas entrar y usar la app. Nada de
        rastreo ni de publicidad. <Link href="/privacidad">Más información</Link>.
      </p>
      <button type="button" className={styles.cookieButton} onClick={aceptar}>
        Entendido
      </button>
    </div>
  )
}
