import type { Metadata } from 'next'
import styles from './create.module.css'

export const metadata: Metadata = {
  title: 'Crear Lista | ListaCompra',
  description: 'Crea una nueva lista de la compra, ya sea desde cero o usando una plantilla.',
}

export default function CreateListPage() {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Crear Nueva Lista</h1>
      <p className={styles.description}>
        Aquí podrás crear una nueva lista de la compra. Esta funcionalidad estará disponible próximamente.
      </p>
    </div>
  )
}