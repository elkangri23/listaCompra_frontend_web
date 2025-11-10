'use client';

import { useParams, useRouter } from 'next/navigation';

export default function ProductHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  return (
    <section>
      <header>
        <button onClick={() => router.back()}>
          &larr; Volver
        </button>
        <h1>Historial de Compras</h1>
        <p>
          Productos que has comprado anteriormente. Esta página se reconstruirá.
        </p>
      </header>

      <div>
        <h2>Productos Comprados</h2>
        <p>Cargando historial...</p>
        {/* La tabla y el contenido dinámico se eliminarán temporalmente */}
      </div>

      <footer>
        <button onClick={() => router.push(`/lists/${listId}`)}>
          Volver a la lista
        </button>
      </footer>
    </section>
  );
}