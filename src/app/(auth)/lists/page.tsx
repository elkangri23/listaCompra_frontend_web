'use client';

import { Heading } from '@/components/ui';
import { useLists, useCreateList } from '@/features/lists/hooks/use-lists';
import { ListsTable } from '@/features/lists/components/lists-table';
import { CreateListDialog } from '@/features/lists/components/create-list-dialog';
import { CreateListDto } from '@/types/dtos/lists';

export default function ListsPage() {
  const { data: lists, isLoading, isError } = useLists();
  const createListMutation = useCreateList();

  const handleCreateList = (data: CreateListDto) => {
    createListMutation.mutate(data);
  };

  return (
    <section className="p-4 md:p-6">
      <header className="flex items-center justify-between mb-6">
        <Heading level={1}>
          Mis Listas
        </Heading>
        <CreateListDialog onSubmit={handleCreateList} />
      </header>
      {isLoading && <p>Cargando...</p>}
      {isError && <p>Error al cargar las listas.</p>}
      {lists && <ListsTable lists={lists} />}
    </section>
  );
}
