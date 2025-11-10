'use client';

import { useParams, useRouter } from 'next/navigation';
import styles from './history.module.css';

export default function ProductHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  return (
    <section className={styles.root}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          &larr; Volver
        </button>
        <div>
          <h1 className={styles.title}>Historial de Compras</h1>
          <p>Productos que has comprado anteriormente. Esta página se reconstruirá.</p>
        </div>
      </header>

      <div className={styles.content}>
        <h2>Productos Comprados</h2>
        <p>Cargando historial...</p>
        {/* La tabla y el contenido dinámico se eliminarán temporalmente */}
      </div>

      <footer className={styles.footer}>
        <button className={styles.backButton} onClick={() => router.push(`/lists/${listId}`)}>
          Volver a la lista
        </button>
      </footer>
    </section>
  );
}