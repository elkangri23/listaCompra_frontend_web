'use client';

import { Heading } from '@/components/ui';
import { useList } from '@/features/lists/hooks/use-lists';
import { useParams } from 'next/navigation';

export default function ListDetailPage() {
  const params = useParams();
  const { id } = params;
  const { data: list, isLoading, isError } = useList(id as string);

  return (
    <section className="p-4 md:p-6">
      {isLoading && <p>Cargando...</p>}
      {isError && <p>Error al cargar la lista.</p>}
      {list && (
        <header className="mb-6">
          <Heading level={1}>{list.nombre}</Heading>
          <p className="text-muted-foreground">{list.descripcion}</p>
        </header>
      )}
      {/* TODO: Add products table */}
    </section>
  );
}
