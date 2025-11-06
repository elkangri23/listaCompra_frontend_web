'use client';

import { useMemo, useState } from 'react';
import { Heading, Text, Input } from '@/components/ui';
import { useList } from '@/features/lists/hooks/use-lists';
import { useParams } from 'next/navigation';
import { InviteUserDialog } from '@/features/invitations/components/invite-user-dialog';
import { useInviteUser } from '@/features/invitations/hooks/use-invitations';
import { InviteUserFormValues } from '@/features/invitations/components/invite-user-form';

export default function ListDetailPage() {
  const params = useParams();
  const { id } = params;
  const { data: list, isLoading, isError } = useList(id as string);
  const inviteUserMutation = useInviteUser(id as string);

  const handleInviteUser = (data: InviteUserFormValues) => {
    inviteUserMutation.mutate(data);
  };

  return (
    <section className="p-4 md:p-6">
      {isLoading && <p>Cargando lista...</p>}
      {isError && <p>Error al cargar la lista.</p>}
      {list && (
        <header className="mb-6 flex items-center justify-between">
          <div>
            <Heading level={1}>{list.nombre}</Heading>
            <p className="text-muted-foreground">{list.descripcion}</p>
          </div>
          <InviteUserDialog onSubmit={handleInviteUser} />
        </header>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              resetPagination();
            }}
            className="w-64"
            aria-label="Buscar productos"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as typeof statusFilter);
              resetPagination();
            }}
            className="flex h-10 w-44 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="purchased">Comprados</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              resetPagination();
            }}
            className="flex h-10 w-52 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
        </div>
        <CreateProductDialog
          categories={categories}
          onSubmit={handleCreateProduct}
          isSubmitting={createProductMutation.isPending}
        />
      </div>

      {resumen && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <Text variant="small" className="mb-1 uppercase tracking-wide">
              Productos comprados
            </Text>
            <Heading level={3}>{resumen.comprados}</Heading>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <Text variant="small" className="mb-1 uppercase tracking-wide">
              Productos pendientes
            </Text>
            <Heading level={3}>{resumen.pendientes}</Heading>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <Text variant="small" className="mb-1 uppercase tracking-wide">
              Urgentes
            </Text>
            <Heading level={3}>{resumen.urgentes}</Heading>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <Text variant="small" className="mb-1 uppercase tracking-wide">
              Valor total estimado
            </Text>
            <Heading level={3}>
              {resumen.valorTotal !== undefined && resumen.valorTotal !== null
                ? `${resumen.valorTotal.toFixed(2)} €`
                : '-'}
            </Heading>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {isLoadingProducts && <p>Cargando productos...</p>}
        {hasProductsError && !isLoadingProducts && (
          <p>Error al cargar los productos de la lista.</p>
        )}
        {!isLoadingProducts && !hasProductsError && (
          <ProductsTable
            products={products}
            categories={categories}
            categoriesMap={categoriesMap}
            onTogglePurchased={handleTogglePurchased}
            onDelete={handleDeleteProduct}
            onEdit={handleEditProduct}
            onAdjustQuantity={handleAdjustQuantity}
            onReorder={handleReorderProducts}
            pendingProductId={activeProductId}
            isActionPending={isMutatingProduct}
            isReordering={reorderProductsMutation.isPending}
          />
        )}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (page === 1) return;
                  setPage((prev) => Math.max(prev - 1, 1));
                }}
                isDisabled={page === 1}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setPage(index + 1);
                  }}
                  isActive={page === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
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
