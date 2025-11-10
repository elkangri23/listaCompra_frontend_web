'use client';

import { useState } from 'react';
import { useLists } from '@/features/lists/hooks/use-lists';
import { useDebounce } from '@/hooks/use-debounce';
import dynamic from 'next/dynamic';

const ListsTable = dynamic(
  () => import('@/features/lists/components/lists-table').then((mod) => mod.ListsTable),
  { ssr: false }
);

export default function ListsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data, isLoading, isError } = useLists(
    debouncedSearchTerm,
    page,
    limit
  );

  const lists = data?.data ?? [];
  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <section>
      <header>
        <h1>Mis Listas</h1>
        <div>
          <input
            type="text"
            placeholder="Buscar listas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* CreateListDialog has been removed */}
        </div>
      </header>
      {isLoading && <p>Cargando...</p>}
      {isError && <p>Error al cargar las listas.</p>}
      {lists && <ListsTable lists={lists} />}
      {totalPages > 1 && (
        <footer>
          {/* Pagination has been removed */}
          <p>Página {page} de {totalPages}</p>
        </footer>
      )}
    </section>
  );
}