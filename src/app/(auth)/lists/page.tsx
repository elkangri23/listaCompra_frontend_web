'use client';

import { useState } from 'react';
import { Heading, Input } from '@/components/ui';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useLists, useCreateList } from '@/features/lists/hooks/use-lists';
import { useDebounce } from '@/hooks/use-debounce';
import { ListsTable } from '@/features/lists/components/lists-table';
import { CreateListDialog } from '@/features/lists/components/create-list-dialog';
import { CreateListDto } from '@/types/dtos/lists';

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
  const createListMutation = useCreateList();

  const handleCreateList = (data: CreateListDto) => {
    createListMutation.mutate(data);
  };

  const lists = data?.data ?? [];
  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <section className="p-4 md:p-6">
      <header className="flex items-center justify-between mb-6">
        <Heading level={1}>
          Mis Listas
        </Heading>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Buscar listas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <CreateListDialog onSubmit={handleCreateList} />
        </div>
      </header>
      {isLoading && <p>Cargando...</p>}
      {isError && <p>Error al cargar las listas.</p>}
      {lists && <ListsTable lists={lists} />}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page === 1) return;
                  setPage((prev) => Math.max(prev - 1, 1));
                }}
                isDisabled={page === 1}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page === totalPages) return;
                  setPage((prev) => Math.min(prev + 1, totalPages));
                }}
                isDisabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
  );
}
