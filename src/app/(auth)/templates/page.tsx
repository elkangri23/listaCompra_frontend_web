import type { Metadata } from 'next'
import styles from './templates.module.css'

export const metadata: Metadata = {
  title: 'Plantillas | ListaCompra',
  description: 'Crea y gestiona tus plantillas de listas de la compra.',
}

export default function TemplatesPage() {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Plantillas</h1>
      <p className={styles.description}>
        Aquí podrás ver y gestionar tus plantillas de listas predefinidas. Esta
        funcionalidad estará disponible próximamente.
      </p>
    </div>
  )
}